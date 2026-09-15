// Shared option/label maps for the Forms addon.
// Forms live in flow.forms, questions in flow.form_questions.

export const FORM_STATUSES = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Closed", label: "Closed" },
];

export const QUESTION_TYPES = [
  { value: "short", label: "Short answer" },
  { value: "paragraph", label: "Paragraph" },
  { value: "multiple", label: "Multiple choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
];

export const DEFAULT_FORM_STATUS = "Draft";
export const DEFAULT_QUESTION_TYPE = "short";

export const statusLabels = Object.fromEntries(
  FORM_STATUSES.map((status) => [status.value, status.label]),
);
