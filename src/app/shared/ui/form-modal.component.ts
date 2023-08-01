import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: "app-form-modal",
  template: `
    <header>
      <h2>{{ title }}</h2>
      <button (click)="dismiss()">close</button>
    </header>
    <section>
      <form [formGroup]="formGroup" (ngSubmit)="handleSave()">
        <div *ngFor="let control of formGroup.controls | keyvalue">
          <label>{{ control.key }}</label>
          <input type="text" [formControlName]="control.key" />
        </div>
        <button color="dark" type="submit" [disabled]="!formGroup.valid">
          Save
        </button>
      </form>
    </section>
  `,
  styles: [
    `
      form {
        padding: 1rem;
      }

      div {
        display: flex;
        flex-direction: column;

        label {
          margin-bottom: 1rem;
          font-weight: bold;
        }

        input {
          font-size: 1.5rem;
          padding: 10px;
        }
      }

      section button {
        margin-top: 1rem;
        width: 100%;
      }

    `,
  ],
})
export class FormModalComponent {
  @Input() title!: string;
  @Input() formGroup!: FormGroup;

  @Output() save = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  constructor() {}

  handleSave() {
    this.save.emit(true);
    this.dismiss();
  }

  dismiss() {
    this.formGroup.reset();
    this.close.emit();
  }
}
