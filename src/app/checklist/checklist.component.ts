import { CommonModule } from "@angular/common";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ChecklistService } from "../shared/data-access/checklist.service";
import { ChecklistItem } from "../shared/interfaces/checklist-item";
import { FormModalComponent } from "../shared/ui/form-modal.component";
import { ModalComponent } from "../shared/ui/modal.component";
import { ChecklistItemService } from "./data-access/checklist-item.service";
import { ChecklistItemHeaderComponent } from "./ui/checklist-item-header.component";
import { ChecklistItemListComponent } from "./ui/checklist-item-list.component";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ChecklistItemHeaderComponent,
    ChecklistItemListComponent,
    ModalComponent,
    FormModalComponent,
  ],
  selector: "app-checklist",
  template: `
    <app-checklist-item-header
      *ngIf="checklist() as checklist"
      [checklist]="checklist"
      (addItem)="checklistItemBeingEdited.set({})"
      (resetChecklist)="cis.reset$.next($event)"
    />

    <app-checklist-item-list
      [checklistItems]="cis.checklistItems()"
      (toggle)="
        cis.toggle$.next({
          checklistId: checklist()!.id,
          checklistItemId: $event
        })
      "
      (delete)="
        cis.remove$.next({
          checklistId: checklist()!.id,
          checklistItemId: $event
        })
      "
      (edit)="checklistItemBeingEdited.set($event)"
    />

    <app-modal [isOpen]="!!checklistItemBeingEdited()">
      <ng-template>
        <app-form-modal
          [title]="checklistItemBeingEdited()?.id ? 'Edit Item' : 'Create item'"
          [formGroup]="checklistItemForm"
          (close)="checklistItemBeingEdited.set(null)"
          (save)="
            checklistItemBeingEdited()?.id
              ? cis.edit$.next({
                checklistId: checklist()!.id,
                checklistItemId: checklistItemBeingEdited()!.id!,
                data: checklistItemForm.getRawValue(),
              })
              : cis.add$.next({
                item: checklistItemForm.getRawValue(),
                checklistId: checklist()?.id!,
              })
          "
        ></app-form-modal>
      </ng-template>
    </app-modal>
  `,
  providers: [ChecklistItemService]
})
export default class ChecklistComponent {
  cs = inject(ChecklistService);
  cis = inject(ChecklistItemService);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  checklist = computed(() =>
    this.cs
      .checklists()
      .find((checklist) => checklist.id === this.params()?.get("id"))
  );

  checklistItemForm = this.fb.nonNullable.group({
    title: ["", Validators.required],
  });

  constructor() {
    effect(() => {
      const item = this.checklistItemBeingEdited();
      if (item) {
        this.checklistItemForm.patchValue({
          title: item.title,
        });
      }
    });
  }
}
