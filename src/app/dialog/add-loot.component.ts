import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { Loot, LootType } from '../loot.defs';
import { LootCardComponent } from "../loot-card.component";

export interface AddLootData {
  poolNames: string[];
}

@Component({
  selector: 'add-loot-dialog',
  template: `
<span mat-dialog-title>New Loot</span>
<mat-dialog-content>
  <form [formGroup]="lootForm">
    <mat-form-field class="dialog-string" appearance="outline">
      <mat-label>Loot Name</mat-label>
      <input matInput formControlName="name" required />
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Loot Type</mat-label>
      <mat-select matNativeControl formControlName="type" required>
        @for (type of types; track $index) {
          <mat-option [value]="type">{{type}}</mat-option>
        }
      </mat-select>
    </mat-form-field>
    <mat-form-field class="dialog-string" appearance="outline">
      <mat-label>Loot Description</mat-label>
      <textarea matInput formControlName="description"></textarea>
    </mat-form-field>
    <mat-form-field class="dialog-string" appearance="outline">
      <mat-label>Loot Basic</mat-label>
      <textarea matInput formControlName="basic"></textarea>
    </mat-form-field>
    <mat-form-field class="dialog-string" appearance="outline">
      <mat-label>Loot Charged</mat-label>
      <textarea matInput formControlName="charged"></textarea>
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Source Pool</mat-label>
      <mat-select formControlName="source" required>
        @for (pool of data.poolNames; track $index) {
          <mat-option [value]="pool">{{pool}}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  </form>
  <loot-card [hidden]="!lootForm.valid" [loot]="loot" />
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="loot" [disabled]="!lootForm.valid">Add</button>
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
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    LootCardComponent
],
  styleUrl: './common-dialog.scss'
})
export class AddLootDialogComponent implements OnInit {

  @ViewChild(LootCardComponent) card!: LootCardComponent;

  readonly types = Object.values(LootType);
  readonly data = inject<AddLootData>(MAT_DIALOG_DATA);

  anyText: ValidatorFn = (formGroup) => {
    const g = formGroup as FormGroup;
    const nonEmptyIndex = ['basic', 'charged', 'description'].findIndex(f => (g.get(f)?.value ?? '' as string).length > 0);
    return nonEmptyIndex >= 0 ? null : { allTextEmpty: true };
  }

  lootForm = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required
      ],
      nonNullable: true
    }),
    type: new FormControl<LootType>(LootType.WEAPON, {
      validators: [
        Validators.required
      ],
      nonNullable: true
    }),
    basic: new FormControl<string>('', { nonNullable: true }),
    charged: new FormControl<string>('', { nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true }),
    source: new FormControl<string>('', {
      validators: [
        Validators.required
      ],
      nonNullable: true
    })
  }, this.anyText);

  get loot() {
    const value = this.lootForm.value;
    const valueAsLoot = new Loot(
      value.name ?? '',
      value.type ?? LootType.WEAPON,
      value.source ?? '',
      {
        basic: value.basic,
        charged: value.charged,
        description: value.description
      });
    return valueAsLoot;
  }

  ngOnInit(): void {
    this.lootForm.valueChanges.subscribe(async () => {
      if (this.lootForm.valid) {
        this.card.loot = this.loot;
        await this.card.refreshBody();
      }
    });
  }
}
