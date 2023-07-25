import { Injectable } from "@angular/core";
import {
  addRxPlugin,
  RxCollection,
  RxDatabase,
  RxDocument,
  RxJsonSchema,
} from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { from, shareReplay, switchMap } from "rxjs";
import { Checklist } from "../interfaces/checklist";

export type ChecklistDocument = RxDocument<Checklist>;
export type ChecklistCollection = RxCollection<Checklist>;
export type DatabaseCollections = {
  checklists: ChecklistCollection;
};
export type QuicklistsDatabase = RxDatabase<DatabaseCollections>;

@Injectable({
  providedIn: "root",
})
export class StorageService {

  db$ = from(this.initDb()).pipe(shareReplay(1))
  checklists$ = this.db$.pipe(
    switchMap((db) => db.checklists.find().$)
  ) 
  
  async initDb() {
    addRxPlugin(RxDBDevModePlugin);

    const db = await createRxDatabase<DatabaseCollections>({
      name: "quicklists",
      storage: getRxStorageDexie(),
    });

    const checklistsSchema: RxJsonSchema<Checklist> = {
      version: 0,
      primaryKey: "id",
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        title: {
          type: "string",
        },
        checklistItems: {
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
        },
      },
      required: ["id", "title"],
    };

    return await db.addCollections({
      checklists: {
        schema: checklistsSchema,
      },
    });
  }
}
