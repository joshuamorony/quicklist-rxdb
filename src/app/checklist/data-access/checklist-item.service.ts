import { Injectable, signal, effect, computed, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { Subject, switchMap, withLatestFrom } from "rxjs";
import { RemoveChecklist } from "src/app/shared/interfaces/checklist";
import { StorageService } from "../../shared/data-access/storage.service";
import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
} from "../../shared/interfaces/checklist-item";

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ChecklistItemService {
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);

  // state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
  });

  // selectors
  checklistItems = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded);

  // sources
  private checklistItemsLoaded$ = this.route.paramMap.pipe(
    switchMap((params) =>
      this.storageService.getChecklistItems(params.get("id")!)
    )
  );

  add$ = new Subject<AddChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  edit$ = new Subject<EditChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();

  constructor() {
    // reducer
    this.checklistItemsLoaded$
      .pipe(takeUntilDestroyed())
      .subscribe((checklistItems) =>
        this.state.update((state) => ({
          ...state,
          checklistItems,
          loaded: true,
        }))
      );

    // db updates
    this.add$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(async ([checklistItem, db]) => {
        const checklistToUpdate = await db.checklists
          .findOne(checklistItem.checklistId)
          .exec();

        checklistToUpdate.modify((checklist: any) => ({
          ...checklist,
          checklistItems: [
            ...checklist.checklistItems,
            {
              id: Date.now().toString(),
              checked: false,
              ...checklistItem.item,
            },
          ],
        }));
      });

    this.remove$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(async ([ids, db]) => {
        const checklistToUpdate = await db.checklists
          .findOne(ids.checklistId)
          .exec();

        checklistToUpdate.modify((checklist: any) => ({
          ...checklist,
          checklistItems: checklist.checklistItems.filter(
            (item: any) => item.id !== ids.checklistItemId
          ),
        }));
      });

    this.edit$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(async ([update, db]) => {
        const checklistToUpdate = await db.checklists
          .findOne(update.checklistId)
          .exec();

        checklistToUpdate.modify((checklist: any) => ({
          ...checklist,
          checklistItems: checklist.checklistItems.map((item: any) =>
            item.id === update.checklistItemId
              ? { ...item, title: update.data.title }
              : item
          ),
        }));
      });

    this.toggle$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(async ([ids, db]) => {
        const checklistToUpdate = await db.checklists
          .findOne(ids.checklistId)
          .exec();

        checklistToUpdate.modify((checklist: any) => ({
          ...checklist,
          checklistItems: checklist.checklistItems.map((item: any) =>
            item.id === ids.checklistItemId
              ? { ...item, checked: !item.checked }
              : item
          ),
        }));
      });

    this.reset$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(async ([checklistId, db]) => {
        const checklistToUpdate = await db.checklists
          .findOne(checklistId)
          .exec();

        checklistToUpdate.modify((checklist: any) => ({
          ...checklist,
          checklistItems: checklist.checklistItems.map((item: any) =>
            item.checklistId === checklistId
              ? { ...item, checked: false }
              : item
          ),
        }));
      });
  }
}
