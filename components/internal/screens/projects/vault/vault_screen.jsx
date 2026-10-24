"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Fingerprint, Key, KeyRound, Plus, Trash2 } from "lucide-react";
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
import { PasskeysDialog } from "./passkeys_dialog";
import FilterDropdown from "../overview/filter_dropdown";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  LoadingArea,
} from "@geiger/ui";
import {
  listVaultItems,
  createVaultItem,
  updateVaultItem,
  duplicateVaultItem,
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
  const [deletingItem, setDeletingItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passkeysOpen, setPasskeysOpen] = useState(false);

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
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query) ||
          item.username?.toLowerCase().includes(query);
        const matchesType = filterType === "all" || item.type === filterType;
        return matchesSearch && matchesType;
      }),
    [vaultItems, searchQuery, filterType],
  );

  const pager = usePagination(filteredItems, {
    resetKey: `${searchQuery}|${filterType}`,
  });

  const stats = useMemo(() => {
    const restricted = vaultItems.filter((item) => item.accessMode !== "project").length;
    const passkey = vaultItems.filter((item) => item.accessMethod === "passkey").length;
    return [
      { label: "Total secrets", value: String(vaultItems.length), footer: `${VAULT_TYPES.length} secret types` },
      { label: "Passwords", value: String(vaultItems.filter((item) => item.type === "password").length), footer: "Password secrets" },
      { label: "API keys", value: String(vaultItems.filter((item) => item.type === "api_key").length), footer: "API key secrets" },
      { label: "Restricted", value: String(restricted), footer: `${passkey} opened by passkey` },
    ];
  }, [vaultItems]);

  const handleAddItem = async (form) => {
    const optimisticId = crypto.randomUUID();
    const optimistic = {
      id: optimisticId,
      projectId,
      name: form.name,
      type: form.type,
      url: form.url,
      notes: form.notes,
      username: "",
      accessMethod: form.accessMethod,
      accessMode: "project",
      allowedEmails: [],
      canOpen: true,
      canManage: true,
      hasSecret: true,
      hasCode: form.accessMethod !== "passkey",
    };

    setVaultItems((prev) => [...prev, optimistic]);

    const created = await createVaultItem(projectId, { ...form, id: optimisticId });
    if (!created) {
      setVaultItems((prev) => prev.filter((item) => item.id !== optimisticId));
      toast.error("Couldn't save the secret.");
      return;
    }

    setVaultItems((prev) => prev.map((item) => (item.id === created.id ? created : item)));
    toast.success("Secret saved");
  };

  const handleUpdateItem = async (patch, successMessage = "Secret updated") => {
    const previous = vaultItems.find((item) => item.id === patch.id);
    if (!previous) {
      return;
    }

    const { id, secret: _secret, code: _code, ...visible } = patch;
    setVaultItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...visible } : item)));

    const updated = await updateVaultItem(id, patch);
    if (!updated) {
      setVaultItems((prev) => prev.map((item) => (item.id === id ? previous : item)));
      toast.error("Couldn't save the secret.");
      return;
    }

    setVaultItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    toast.success(successMessage);
  };

  const handleDeleteItem = async (item) => {
    setVaultItems((prev) => prev.filter((entry) => entry.id !== item.id));

    const ok = await softDeleteVaultItem(item.id);
    if (!ok) {
      setVaultItems((prev) => [...prev, item]);
      toast.error("Couldn't delete the secret.");
    } else {
      toast.success("Secret deleted");
    }
  };

  const handleDuplicate = async (item) => {
    const optimisticId = crypto.randomUUID();
    const optimistic = {
      ...item,
      id: optimisticId,
      name: `${item.name} (Copy)`,
      canManage: true,
    };

    setVaultItems((prev) => [...prev, optimistic]);

    const created = await duplicateVaultItem(projectId, item, optimisticId);
    if (!created) {
      setVaultItems((prev) => prev.filter((entry) => entry.id !== optimisticId));
      toast.error("Couldn't duplicate the secret.");
      return;
    }

    setVaultItems((prev) => prev.map((entry) => (entry.id === created.id ? created : entry)));
    toast.success("Secret duplicated");
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Vault"
        description="Keep the project's secrets encrypted, and choose who can open each one."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setPasskeysOpen(true)} className="border border-border">
              <Fingerprint className="h-4 w-4" />
              Passkeys
            </Button>
            <Button onClick={openAddDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Secret
            </Button>
          </div>
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
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search secrets…" />
      </Toolbar>

      {loading ? (
        <LoadingArea panel label="Loading vault" className="rounded-none min-h-[280px]" />
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={searchQuery || filterType !== "all" ? KeyRound : Key}
            title={searchQuery || filterType !== "all" ? "No secrets found" : "No secrets yet"}
            description={
              searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters."
                : "Add your first secret to get started."
            }
            action={
              <Button onClick={openAddDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                onDelete={() => setDeletingItem(item)}
                onDuplicate={() => handleDuplicate(item)}
                onAccessCredential={() => {
                  setViewingAccessControl(null);
                  setAccessingItem(item);
                }}
                onAccessControl={() => {
                  setAccessingItem(null);
                  setViewingAccessControl(item);
                }}
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
        onSave={(form) => {
          if (editingItem) {
            handleUpdateItem(form);
          } else {
            handleAddItem(form);
          }
          setDialogOpen(false);
          setEditingItem(null);
        }}
      />

      {accessingItem && (
        <VaultCredentialAccessDialog
          key={accessingItem.id}
          item={accessingItem}
          open={!!accessingItem}
          onOpenChange={(open) => {
            if (!open) setAccessingItem(null);
          }}
          onManagePasskeys={() => setPasskeysOpen(true)}
        />
      )}

      {viewingAccessControl && (
        <VaultAccessControl
          key={viewingAccessControl.id}
          item={viewingAccessControl}
          open={!!viewingAccessControl}
          onOpenChange={(open) => {
            if (!open) setViewingAccessControl(null);
          }}
          onSave={(patch) => {
            handleUpdateItem(patch, "Access updated");
            setViewingAccessControl(null);
          }}
        />
      )}

      <PasskeysDialog open={passkeysOpen} onOpenChange={setPasskeysOpen} />

      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove secret</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{deletingItem?.name}</span> and its stored value will be
              destroyed. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingItem(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => {
                const item = deletingItem;
                setDeletingItem(null);
                if (item) handleDeleteItem(item);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default VaultScreen;
