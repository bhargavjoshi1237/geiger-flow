// Shared option maps and validation for the Vault feature. No row data lives here.

import { Fingerprint, Key, LockKeyhole, ShieldCheck, UserCheck, Users } from "lucide-react";

// How a secret is opened. Mirrors the flow.vault_items.access_method check constraint.
export const ACCESS_METHODS = [
  {
    value: "pin",
    label: "PIN",
    description: "4 to 8 digits, shared with the people who open it",
    icon: LockKeyhole,
  },
  {
    value: "password",
    label: "Password",
    description: "At least 8 characters, shared with the people who open it",
    icon: Key,
  },
  {
    value: "passkey",
    label: "Passkey",
    description: "Each person confirms with their own passkey",
    icon: Fingerprint,
  },
];

// Who may open a secret. Mirrors the flow.vault_items.access_mode check constraint.
export const ACCESS_MODES = [
  {
    value: "project",
    label: "Everyone in the project",
    description: "Anyone in the project who passes the secret's check",
    icon: Users,
  },
  {
    value: "managers",
    label: "Managers only",
    description: "The person who added it, the project's creator and organization owners",
    icon: ShieldCheck,
  },
  {
    value: "people",
    label: "Specific people",
    description: "Managers, plus the people you list by email",
    icon: UserCheck,
  },
];

export const ACCESS_MODE_LABELS = {
  project: null,
  managers: "Managers only",
  people: "Specific people",
};

// Same rules as flow.vault_save_secret, checked first so the form can explain a problem before saving.
export function validateAccessCode(method, code) {
  if (method === "pin" && !/^[0-9]{4,8}$/.test(code)) {
    return "A PIN must be 4 to 8 digits.";
  }
  if (method === "password" && code.length < 8) {
    return "A password must be at least 8 characters.";
  }
  return null;
}

// Lowercased, trimmed and de-duplicated, the way flow.vault_can_open compares them.
export function normalizeEmails(emails = []) {
  return [...new Set(emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean))];
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}
