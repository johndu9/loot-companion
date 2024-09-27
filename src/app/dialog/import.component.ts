import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'import-dialog',
  template: `
<span mat-dialog-title>Import</span>
<mat-dialog-content>
  <button mat-flat-button (click)="fileInput.click()">Select file</button>
  @if (file) {
    <span class="mat-body-medium">{{file.name}}</span>
  }
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="file" [disabled]="!file">Import</button>
</mat-dialog-actions>
<input id="file" #fileInput type="file" accept=".json" (change)="onFileSelect($event)">
`,
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatInputModule
  ],
  styleUrl: './common-dialog.scss'
})
export class ImportDialogComponent {
  file: File | false = false;

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length === 1) {
      this.file = files.item(0) ?? false;
    }
  }
}
