import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'add-player-dialog',
  template: `
<span mat-dialog-title>New Character</span>
<mat-dialog-content>
  <mat-form-field class="dialog-string" appearance="outline">
    <mat-label>Character Name</mat-label>
    <input matInput [(ngModel)]="name" />
  </mat-form-field>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="name" cdkFocusInitial>Add</button>
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
    FormsModule
  ],
  styleUrl: './common-dialog.scss'
})
export class AddPlayerDialog {
  name: string = '';
}
