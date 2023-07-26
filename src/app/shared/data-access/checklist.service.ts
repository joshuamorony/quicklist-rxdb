import { computed, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, withLatestFrom } from "rxjs";
import { AddChecklist, RemoveChecklist } from "../interfaces/checklist";
import { StorageService } from "./storage.service";
import { Checklist, EditChecklist } from "../interfaces/checklist";

export interface ChecklistsState {
  checklists: Checklist[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  private storageService = inject(StorageService);

  // state
  private state = signal<ChecklistsState>({
    checklists: [],
    loaded: false,
    error: null,
  });

  // selectors
  checklists = computed(() => this.state().checklists);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  private checklistsLoaded$ = this.storageService.checklists$;
  add$ = new Subject<AddChecklist>();
  edit$ = new Subject<EditChecklist>();
  remove$ = new Subject<RemoveChecklist>();

  constructor() {
    // reducer
    this.checklistsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (checklists) =>
        this.state.update((state) => ({
          ...state,
          checklists,
          loaded: true,
        })),
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    // db updates
    this.add$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(([checklist, db]) => {
        db.checklists.insert({
          ...this.addIdToChecklist(checklist),
          checklistItems: [],
        });
      });

    this.edit$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(async ([update, db]) => {
        const checklistToUpdate = await db.checklists.findOne(update.id).exec();

        if (!checklistToUpdate) return;

        checklistToUpdate.modify((checklist) => ({
          ...checklist,
          title: update.data.title,
        }));
      });

    this.remove$
      .pipe(withLatestFrom(this.storageService.db$), takeUntilDestroyed())
      .subscribe(async ([id, db]) => {
        const checklistToRemove = await db.checklists.findOne(id).exec();
        if(!checklistToRemove) return;

          checklistToRemove.remove();
      });
  }

  private addIdToChecklist(checklist: AddChecklist) {
    return {
      ...checklist,
      id: this.generateSlug(checklist.title),
    };
  }

  private generateSlug(title: string) {
    // NOTE: This is a simplistic slug generator and will not handle things like special characters.
    let slug = title.toLowerCase().replace(/\s+/g, "-");

    // Check if the slug already exists
    const matchingSlugs = this.checklists().find(
      (checklist) => checklist.id === slug
    );

    // If the title is already being used, add a string to make the slug unique
    if (matchingSlugs) {
      slug = slug + Date.now().toString();
    }

    return slug;
  }
}
