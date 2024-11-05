import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Loot, Pool } from '../loot.defs';
import { MatSelectModule } from '@angular/material/select';

export interface TransferLootData {
  loot: Loot;
  currentPool: Pool;
  pools: Pool[];
}

@Component({
  selector: 'add-player-dialog',
  template: `
<span mat-dialog-title>Transfer {{data.loot.name}} from {{data.currentPool.name}}</span>
<mat-dialog-content>
  <form [formGroup]="transferForm">
    <mat-form-field class="dialog-string" appearance="outline">
      <mat-label>Target</mat-label>
      <mat-select formControlName="target" required>
        @for (pool of data.pools; track $index) {
          <mat-option [value]="pool.name">{{pool.name}}{{data.loot.sourcePool === pool.name ? ' (source)' : ''}}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="targetPoolIndex" [disabled]="!transferForm.valid">Transfer</button>
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
    MatSelectModule,
    FormsModule
  ],
  styleUrl: './common-dialog.scss'
})
export class TransferLootDialogComponent {
  readonly data = inject<TransferLootData>(MAT_DIALOG_DATA);

  samePool: ValidatorFn = (control) => {
    const name = (control as FormControl<string>).value;
    return (this.data.currentPool.name === name) ? { selfTarget: true } : null;
  }

  transferForm = new FormGroup({
    target: new FormControl(this.data.currentPool.name, {
      validators: [Validators.required, this.samePool],
      nonNullable: true
    })
  });

  get targetPoolIndex() {
    const name = this.transferForm.value.target ?? this.data.currentPool.name;
    return this.data.pools.findIndex(p => p.name === name);
  }
}
