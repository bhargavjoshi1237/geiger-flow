"use client";

import React, { useState } from "react";
import {
  Key,
  Plus,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { VaultItemCard } from "./vault_item_card";
import { AddVaultItemDialog } from "./add_vault_item_dialog";
import { VaultAccessControl } from "./vault_access_control";
import FilterDropdown from "../overview/filter_dropdown";

const initialVaultItems = [
  {
    id: "1",
    name: "Production Database",
    type: "database",
    username: "admin",
    url: "prod-db.example.com",
    notes: "Main production database credentials",
    accessControl: {
      type: "team",
      allowedRoles: ["admin"],
      allowedUsers: [],
      allowedPositions: [],
    },
    ttl: null,
    keylessEntry: false,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
  },
  {
    id: "2",
    name: "AWS Production Keys",
    type: "api_key",
    username: "geiger-prod",
    url: "https://console.aws.amazon.com",
    notes: "AWS root account credentials",
    accessControl: {
      type: "roles",
      allowedRoles: ["admin", "devops"],
      allowedUsers: ["john@example.com"],
      allowedPositions: [],
    },
    ttl: "7d",
    keylessEntry: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-02-01T16:20:00Z",
  },
  {
    id: "3",
    name: "Stripe API Key",
    type: "api_key",
    username: "",
    url: "",
    notes: "Stripe live API key for payments",
    accessControl: {
      type: "users",
      allowedRoles: [],
      allowedUsers: ["billing@example.com", "finance@example.com"],
      allowedPositions: ["CTO", "CFO"],
    },
    ttl: null,
    keylessEntry: false,
    createdAt: "2024-01-05T12:00:00Z",
    updatedAt: "2024-01-25T09:30:00Z",
  },
  {
    id: "4",
    name: "GitHub Organization",
    type: "oauth",
    username: "geiger-org",
    url: "https://github.com/geiger-org",
    notes: "GitHub organization admin access",
    accessControl: {
      type: "positions",
      allowedRoles: [],
      allowedUsers: [],
      allowedPositions: ["Tech Lead", "Engineering Manager"],
    },
    ttl: "30d",
    keylessEntry: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-30T11:15:00Z",
  },
  {
    id: "5",
    name: "SMTP Credentials",
    type: "smtp",
    username: "mailer",
    url: "smtp.sendgrid.net",
    notes: "SendGrid SMTP for transactional emails",
    accessControl: {
      type: "team",
      allowedRoles: [],
      allowedUsers: [],
      allowedPositions: [],
    },
    ttl: null,
    keylessEntry: false,
    createdAt: "2024-01-20T15:00:00Z",
    updatedAt: "2024-01-20T15:00:00Z",
  },
];

const VAULT_TYPES = [
  { value: "all", label: "All Types", icon: "" },
  { value: "database", label: "Database", icon: "🗄️" },
  { value: "api_key", label: "API Key", icon: "🔑" },
  { value: "oauth", label: "OAuth", icon: "🔐" },
  { value: "smtp", label: "SMTP", icon: "📧" },
  { value: "password", label: "Password", icon: "🔒" },
  { value: "certificate", label: "Certificate", icon: "📜" },
  { value: "ssh_key", label: "SSH Key", icon: "🖥️" },
  { value: "other", label: "Other", icon: "📦" },
];

export function VaultScreen() {
  const [vaultItems, setVaultItems] = useState(initialVaultItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingAccessControl, setViewingAccessControl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter vault items based on search and type
  const filteredItems = vaultItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddItem = (newItem) => {
    const item = {
      ...newItem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVaultItems([...vaultItems, item]);
  };

  const handleUpdateItem = (updatedItem) => {
    setVaultItems(
      vaultItems.map((item) =>
        item.id === updatedItem.id
          ? { ...updatedItem, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  const handleDeleteItem = (itemId) => {
    setVaultItems(vaultItems.filter((item) => item.id !== itemId));
  };

  const handleDuplicate = (item) => {
    const duplicate = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVaultItems([...vaultItems, duplicate]);
  };

  return (
    <MainScreenWrapper>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Vault</h1>
          <p className="text-[#a3a3a3] mt-1">
            Manage your assets and store them securely.
          </p>
        </div>
                <AddVaultItemDialog 
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
        >
          <button 
            onClick={() => setDialogOpen(true)}
            className="bg-[#e7e7e7] hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-black font-bold stroke-[3]" />
            Add Secret
          </button>
        </AddVaultItemDialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <Input
            placeholder="Search secrets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!pl-10 !pr-4 !py-[7px] bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm placeholder:text-[#737373] focus-visible:ring-0 focus-visible:border-[#474747]"
          />
        </div>
        <FilterDropdown
          value={filterType}
          onValueChange={setFilterType}
          options={VAULT_TYPES.map(type => ({ value: type.value, label: type.label }))}
          placeholder="Select type"
          height="h-10"
        />
      </div>

      {/* Vault Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#2a2a2a] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-4">
            <Key className="w-7 h-7 text-[#474747]" strokeWidth={1.5} />
          </div>
          <p className="text-[#a3a3a3] font-medium mb-1">
            {searchQuery || filterType !== "all"
              ? "No secrets found"
              : "No secrets yet"}
          </p>
          <p className="text-[#737373] text-sm">
            {searchQuery || filterType !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first secret to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <VaultItemCard
              key={item.id}
              item={item}
              onEdit={() => {
                setEditingItem(item);
                setDialogOpen(true);
              }}
              onDelete={() => handleDeleteItem(item.id)}
              onDuplicate={() => handleDuplicate(item)}
              onViewAccessControl={() => setViewingAccessControl(item)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <AddVaultItemDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        onSave={(item) => {
          if (editingItem) {
            handleUpdateItem(item);
          } else {
            handleAddItem(item);
          }
          setIsAddDialogOpen(false);
          setEditingItem(null);
        }}
      />

      {/* Access Control Dialog */}
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
