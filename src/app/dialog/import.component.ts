import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { ImportMode } from '../loot.service';
import { MatSelectModule } from '@angular/material/select';

export interface ImportData {
  file: File,
  mode: ImportMode
}

@Component({
  selector: 'import-dialog',
  template: `
<span mat-dialog-title>Import</span>
<mat-dialog-content>
  <mat-form-field appearance="outline">
    <mat-label>Import Mode</mat-label>
    <mat-select [(value)]="mode" required>
      @for (type of types; track $index) {
        <mat-option [value]="type">{{type}}</mat-option>
      }
    </mat-select>
  </mat-form-field>
  <button mat-flat-button (click)="fileInput.click()">Select file</button>
  @if (file) {
    <span class="mat-body-medium">{{file.name}}</span>
  }
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="data" [disabled]="!file || !mode">Import</button>
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
    MatSelectModule
  ],
  styleUrl: './common-dialog.scss'
})
export class ImportDialogComponent {
  file: File | false = false;
  mode: ImportMode | false = false;
  types = Object.values(ImportMode);

  get data(): ImportData | false {
    return this.file && this.mode && { file: this.file, mode: this.mode };
  }

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length === 1) {
      this.file = files.item(0) ?? false;
    }
  }
}
