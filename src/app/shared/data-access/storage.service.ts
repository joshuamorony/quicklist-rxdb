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
import { Checklist, checklistsSchema } from "../interfaces/checklist";
import { environment } from "src/environments/environment.development";

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
  db$ = from(this.initDb()).pipe(shareReplay(1));
  checklists$ = this.db$.pipe(switchMap((db) => db.checklists.find().$));

  getChecklist(checklistId: string) {
    return this.db$.pipe(
      switchMap((db) => db.checklists.findOne(checklistId).$)
    );
  }

  async initDb() {
    if(!environment.production){

    addRxPlugin(RxDBDevModePlugin);
    }

    const db = await createRxDatabase<DatabaseCollections>({
      name: "quicklists",
      storage: getRxStorageDexie(),
    });

    await db.addCollections({
      checklists: {
        schema: checklistsSchema,
      },
    });

    return db;
  }
}
