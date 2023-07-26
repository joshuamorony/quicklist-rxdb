import { Checklist, RemoveChecklist } from "./checklist";

export type ChecklistItem = Checklist["checklistItems"][number];

export type AddChecklistItem = { item: Pick<ChecklistItem, 'title'>; checklistId: RemoveChecklist };
export type EditChecklistItem = { checklistId: Checklist["id"], checklistItemId: ChecklistItem["id"]; data: AddChecklistItem["item"] };
export type RemoveChecklistItem = { checklistId: Checklist["id"], checklistItemId: ChecklistItem["id"]};
