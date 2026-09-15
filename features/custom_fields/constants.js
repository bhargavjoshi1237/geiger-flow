// Shared option/label maps for the Custom Fields feature.
// Field types/scopes mirror the `flow.custom_fields` columns. No row data here.

export const CUSTOM_FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Boolean" },
  { value: "formula", label: "Formula" },
];

export const CUSTOM_FIELD_SCOPES = ["Tasks", "Milestones", "Goals", "Projects"];

export const DEFAULT_CUSTOM_FIELD_TYPE = "text";
export const DEFAULT_CUSTOM_FIELD_SCOPE = "Tasks";

export const DEFAULT_CUSTOM_FIELD_DRAFT = Object.freeze({
  name: "",
  type: DEFAULT_CUSTOM_FIELD_TYPE,
  scope: DEFAULT_CUSTOM_FIELD_SCOPE,
  required: false,
  options: "",
});

export function getFieldTypeLabel(type) {
  return CUSTOM_FIELD_TYPES.find((item) => item.value === type)?.label || "Text";
}

export function isValidFieldType(type) {
  return CUSTOM_FIELD_TYPES.some((item) => item.value === type);
}

export function isValidFieldScope(scope) {
  return CUSTOM_FIELD_SCOPES.includes(scope);
}
