import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Checklist } from "../../shared/interfaces/checklist";

@Component({
  standalone: true,
  selector: "app-checklist-item-header",
  template: `
    <header>
      <h1>
        {{ checklist.title }}
      </h1>
      <div>
        <button (click)="resetChecklist.emit(checklist.id)">Reset</button>
        <button (click)="addItem.emit()">Add item</button>
      </div>
    </header>
  `,
  styles: [
    `
      button {
        margin-left: 1rem;
      }
    `,
  ],
})
export class ChecklistItemHeaderComponent {
  @Input() checklist!: Checklist;
  @Output() resetChecklist = new EventEmitter<string>();
  @Output() addItem = new EventEmitter<void>();
}
