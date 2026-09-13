export const PROJECT_KINDS = [
  { value: "residence", label: "Residence" },
  { value: "interiors", label: "Interiors" },
  { value: "restoration", label: "Restoration" },
  { value: "structural", label: "Structural" },
  { value: "civic", label: "Civic" },
  { value: "other", label: "Other" },
] as const;

export type ProjectKind = (typeof PROJECT_KINDS)[number]["value"];

export function projectKindLabel(kind?: string): string {
  return PROJECT_KINDS.find((item) => item.value === kind)?.label ?? "Residence";
}
