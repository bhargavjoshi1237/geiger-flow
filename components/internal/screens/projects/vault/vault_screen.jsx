"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Key,
  KeyRound,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import { useProject } from "@/context/project-context";
import { VaultItemCard } from "./vault_item_card";
import { AddVaultItemDialog, VAULT_TYPES } from "./add_vault_item_dialog";
import { VaultCredentialAccessDialog } from "./vault_credential_access_dialog";
import { VaultAccessControl } from "./vault_access_control";
import FilterDropdown from "../overview/filter_dropdown";
import { Button } from "@geiger/ui";
import {
  listVaultItems,
  createVaultItem,
  updateVaultItem,
  softDeleteVaultItem,
} from "@/features/vault/actions";

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  ...VAULT_TYPES.map((type) => ({ value: type.value, label: type.label })),
];

export function VaultScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [accessingItem, setAccessingItem] = useState(null);
  const [viewingAccessControl, setViewingAccessControl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    void listVaultItems(projectId).then((rows) => {
      if (cancelled) {
        return;
      }
      if (rows === null) {
        toast.error("Couldn't load vault items.");
      }
      setVaultItems(rows ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const filteredItems = useMemo(
    () =>
      vaultItems.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.username?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
      }),
    [vaultItems, searchQuery, filterType],
  );

  const pager = usePagination(filteredItems, {
    resetKey: `${searchQuery}|${filterType}`,
  });

  const stats = useMemo(() => {
    const withAccessControl = vaultItems.filter((item) => item.accessControl).length;
    const keyless = vaultItems.filter((item) => item.keylessEntry).length;
    return [
      { label: "Total secrets", value: String(vaultItems.length), footer: `${VAULT_TYPES.length} secret types` },
      { label: "Passwords", value: String(vaultItems.filter((item) => item.type === "password").length), footer: "Password secrets" },
      { label: "API keys", value: String(vaultItems.filter((item) => item.type === "api_key").length), footer: "API key secrets" },
      { label: "Access controlled", value: String(withAccessControl), footer: `${keyless} keyless` },
    ];
  }, [vaultItems]);

  // Maps the dialog's form payload onto the persisted shape.
  const toItemInput = (form) => ({
    name: form.name,
    type: form.type,
    secret: form.secret || "",
    url: form.url || "",
    notes: form.notes || "",
    accessSetup: form.accessSetup,
  });

  const handleAddItem = async (form) => {
    const optimisticId = crypto.randomUUID();
    const optimistic = {
      id: optimisticId,
      projectId,
      username: "",
      ...toItemInput(form),
    };

    setVaultItems((prev) => [...prev, optimistic]);

    const created = await createVaultItem(projectId, { ...optimistic, id: optimisticId });
    if (!created) {
      setVaultItems((prev) => prev.filter((item) => item.id !== optimisticId));
      toast.error("Couldn't save the secret.");
      return;
    }

    setVaultItems((prev) => prev.map((item) => (item.id === created.id ? created : item)));
    toast.success("Secret saved");
  };

  const handleUpdateItem = async (updatedForm) => {
    const previous = vaultItems.find((item) => item.id === updatedForm.id);
    if (!previous) {
      return;
    }

    const optimistic = { ...previous, ...toItemInput(updatedForm), id: previous.id };
    setVaultItems((prev) =>
      prev.map((item) => (item.id === previous.id ? optimistic : item)),
    );

    const updated = await updateVaultItem(previous.id, toItemInput(updatedForm));
    if (!updated) {
      setVaultItems((prev) =>
        prev.map((item) => (item.id === previous.id ? previous : item)),
      );
      toast.error("Couldn't save the secret.");
      return;
    }

    setVaultItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    toast.success("Secret updated");
  };

  const handleDeleteItem = async (itemId) => {
    const previous = vaultItems.find((item) => item.id === itemId);
    setVaultItems((prev) => prev.filter((item) => item.id !== itemId));

    const ok = await softDeleteVaultItem(itemId);
    if (!ok) {
      setVaultItems((prev) => (previous ? [...prev, previous] : prev));
      toast.error("Couldn't delete the secret.");
    } else {
      toast.success("Secret deleted");
    }
  };

  const handleDuplicate = async (item) => {
    const optimisticId = crypto.randomUUID();
    const duplicate = {
      ...item,
      id: optimisticId,
      name: `${item.name} (Copy)`,
    };

    setVaultItems((prev) => [...prev, duplicate]);

    const created = await createVaultItem(projectId, {
      ...duplicate,
      id: optimisticId,
    });
    if (!created) {
      setVaultItems((prev) => prev.filter((entry) => entry.id !== optimisticId));
      toast.error("Couldn't duplicate the secret.");
      return;
    }

    setVaultItems((prev) => prev.map((entry) => (entry.id === created.id ? created : entry)));
    toast.success("Secret duplicated");
  };

  const handleRevealSecret = (item) => {
    setViewingAccessControl(null);
    setAccessingItem(item);
  };

  const handleOpenAccessControl = (item) => {
    setAccessingItem(null);
    setViewingAccessControl(item);
  };

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Vault"
        description="Manage your assets and store them securely."
        actions={
          <Button
            onClick={() => {
              setEditingItem(null);
              setDialogOpen(true);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Secret
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={filterType}
            onValueChange={setFilterType}
            options={TYPE_FILTER_OPTIONS}
            placeholder="Select type"
            height="h-9"
          />
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search secrets…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading vault…
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={searchQuery || filterType !== "all" ? KeyRound : Key}
            title={
              searchQuery || filterType !== "all"
                ? "No secrets found"
                : "No secrets yet"
            }
            description={
              searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters."
                : "Add your first secret to get started."
            }
            action={
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setDialogOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Secret
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pager.pageItems.map((item) => (
              <VaultItemCard
                key={item.id}
                item={item}
                onEdit={() => {
                  setEditingItem(item);
                  setDialogOpen(true);
                }}
                onDelete={() => handleDeleteItem(item.id)}
                onDuplicate={() => handleDuplicate(item)}
                onAccessCredential={() => handleRevealSecret(item)}
                onAccessControl={() => handleOpenAccessControl(item)}
              />
            ))}
          </div>
          <ListPagination {...pager} itemLabel="secrets" />
        </div>
      )}
      <AddVaultItemDialog
        key={editingItem?.id || "new-vault-item"}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        onSave={(item) => {
          if (editingItem) {
            handleUpdateItem(item);
          } else {
            handleAddItem(item);
          }
          setDialogOpen(false);
          setEditingItem(null);
        }}
      />
      {accessingItem && (
        <VaultCredentialAccessDialog
          item={accessingItem}
          open={!!accessingItem}
          onOpenChange={(open) => {
            if (!open) setAccessingItem(null);
          }}
        />
      )}

      {viewingAccessControl && (
        <VaultAccessControl
          item={viewingAccessControl}
          open={!!viewingAccessControl}
          onOpenChange={(open) => {
            if (!open) setViewingAccessControl(null);
          }}
          onSave={(updatedItem) => {
            handleUpdateItem(updatedItem);
            setViewingAccessControl(null);
          }}
        />
      )}
    </MainScreenWrapper>
  );
}

export default VaultScreen;
