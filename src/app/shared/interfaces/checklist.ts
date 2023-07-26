import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const checklistsSchemaLiteral = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    title: {
      type: "string",
    },
    checklistItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          checked: {
            type: "boolean",
          },
        },
        required: ["id", "title", "checked"]
      },
    },
  },
  required: ["id", "title", "checklistItems"],
} as const;
const schemaTyped = toTypedRxJsonSchema(checklistsSchemaLiteral);
export type Checklist = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;
export const checklistsSchema: RxJsonSchema<Checklist> =
  checklistsSchemaLiteral;

export type AddChecklist = Pick<Checklist, "title">;
export type EditChecklist = { id: Checklist["id"]; data: AddChecklist };
export type RemoveChecklist = Checklist["id"];
