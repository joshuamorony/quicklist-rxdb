import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChecklistItem } from "../../shared/interfaces/checklist-item";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: "app-checklist-item-list",
  template: `
    <section>
      <ul>
        <li *ngFor="let item of checklistItems; trackBy: trackByFn">
          <div>
            {{ item.title }}
            <span *ngIf="item.checked">✅</span>
          </div>
          <div>
            <button (click)="toggleItem(item.id)">Toggle</button>
            <button (click)="edit.emit(item)">Edit</button>
            <button (click)="delete.emit(item.id)">Delete</button>
          </div>
        </li>
      </ul>

      <div *ngIf="checklistItems.length === 0">
        <h2>Add an item</h2>
        <p>Click the add button to add your first item to this quicklist</p>
      </div>
    </section>
  `,
  styles: [
    `
      ul {
        padding: 0;
        margin: 0;
      }
      li {
        font-size: 1.5em;
        display: flex;
        justify-content: space-between;
        background: var(--color-light);
        list-style-type: none;
        margin-bottom: 1rem;
        padding: 1rem;

        button {
          margin-left: 1rem;
        }
      }
    `,
  ],
})
export class ChecklistItemListComponent {
  @Input() checklistItems!: ChecklistItem[];
  @Output() toggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<ChecklistItem>();

  toggleItem(itemId: string) {
    this.toggle.emit(itemId);
  }

  trackByFn(index: number, item: ChecklistItem) {
    return item.id;
  }
}
