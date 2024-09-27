import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'confirm-reset-dialog',
  template: `
<span mat-dialog-title>Reset LOOT Squire</span>
<mat-dialog-content>
  <span class="mat-body-medium">This will reset loot, character, and pools to defaults. Are you sure?</span>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="true" class="mat-warn" cdkFocusInitial>Reset</button>
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
export class ConfirmResetDialogComponent {
  name: string = '';
}
