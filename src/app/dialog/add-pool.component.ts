import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Pool } from '../loot.defs';

export interface AddPoolData {
  pool?: Pool;
}

@Component({
  selector: 'add-pool-dialog',
  template: `
<span mat-dialog-title>{{data.pool ? 'Edit Pool' : 'New Pool'}}</span>
<mat-dialog-content>
  <form [formGroup]="poolForm">
    <mat-form-field class="dialog-string" appearance="outline">
      <mat-label>Pool Name</mat-label>
      <input matInput formControlName="name" required />
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="pool" [disabled]="!poolForm.valid">{{data.pool ? 'Update' : 'Add'}}</button>
</mat-dialog-actions>
`,
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule
  ],
  styleUrl: './common-dialog.scss'
})
export class AddPoolDialogComponent {
  readonly data = inject<AddPoolData>(MAT_DIALOG_DATA);

  poolForm = new FormGroup({
    name: new FormControl(this.data.pool?.name ?? '', {
      validators: [Validators.required],
      nonNullable: true
    })
  });

  get pool() {
    const value = this.poolForm.value;
    const hasPool = !!this.data.pool;
    if (hasPool) {
      return {...this.data.pool, name: value.name} as Pool;
    } else {
      return new Pool(value.name ?? '');
    }
  }
}
