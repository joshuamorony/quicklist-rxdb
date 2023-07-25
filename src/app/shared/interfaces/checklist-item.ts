import { Checklist, RemoveChecklist } from "./checklist";

export interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
}

export type AddChecklistItem = { item: Pick<ChecklistItem, 'title'>; checklistId: RemoveChecklist };
export type EditChecklistItem = { checklistId: Checklist["id"], checklistItemId: ChecklistItem["id"]; data: AddChecklistItem["item"] };
export type RemoveChecklistItem = { checklistId: Checklist["id"], checklistItemId: ChecklistItem["id"]};
