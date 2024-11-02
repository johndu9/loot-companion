import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Player, Pool } from '../loot.defs';

export interface AddPlayerData {
  player?: Player;
  pools?: Pool[];
}

@Component({
  selector: 'add-player-dialog',
  template: `
<span mat-dialog-title>{{data.player ? 'Edit Character' : 'New Character'}}</span>
<mat-dialog-content>
  <form [formGroup]="playerForm">
    <mat-form-field class="dialog-string" appearance="outline">
      <mat-label>Character Name</mat-label>
      <input matInput formControlName="name" required />
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="player" [disabled]="!playerForm.valid">{{data.player ? 'Update' : 'Add'}}</button>
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
export class AddPlayerDialogComponent {
  readonly data = inject<AddPlayerData>(MAT_DIALOG_DATA);

  playerForm = new FormGroup({
    name: new FormControl(this.data.player?.name ?? '', {
      validators: [Validators.required],
      nonNullable: true
    })
  });

  get player() {
    const value = this.playerForm.value;
    const hasPlayer = !!this.data.player;
    if (hasPlayer) {
      return {...this.data.player, name: value.name} as Player;
    } else {
      return new Player(value.name ?? '', this.data.pools?.length ?? -1);
    }
  }
}
