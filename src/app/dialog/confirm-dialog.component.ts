import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  description: string;
  buttonText: string;
  isWarn?: boolean;
}

@Component({
  selector: 'confirm-dialog',
  template: `
<span mat-dialog-title>{{data.title}}</span>
<mat-dialog-content>
  <span class="mat-body-medium">{{data.description}}</span>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="true" [class.mat-warn]="data.isWarn ?? false" cdkFocusInitial>{{data.buttonText}}</button>
</mat-dialog-actions>
`,
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  styleUrl: './common-dialog.scss'
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
