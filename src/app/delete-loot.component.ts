import { Component, inject } from '@angular/core';
import { LootListComponent } from './loot-list.component';
import { LootService } from './loot.service';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'delete-loot',
  standalone: true,
  imports: [LootListComponent],
  template: `
<loot-list
  [buttonIcon]="'delete_forever'"
  [buttonText]="'Delete loot'"
  [isButtonWarn]="true"
  (select)="deleteLoot($event)"
  />
`,
  styleUrl: './app.component.scss'
})
export class DeleteLootComponent {
  constructor(private lootService: LootService) { }

  readonly dialog = inject(MatDialog);

  deleteLoot(event: {name: string, index: number}) {
    const pool = this.lootService.poolOfLoot(event.index);
    const dialogRef = this.dialog.open(DeleteLootDialog,
      {data: {lootName: event.name, poolName: pool ? pool.name : ''}});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lootService.removeLootDef(event.index);
      }
    });
  }
}

interface DeleteData {
  lootName: string;
  poolName: string;
}

@Component({
  selector: 'delete-loot-dialog',
  template: `
<span mat-dialog-title>Deleting {{data.lootName}}</span>
<mat-dialog-content>
  <span class="mat-body-medium">{{data.poolName}} has {{data.lootName}}. Are you sure?</span>
</mat-dialog-content>
<mat-dialog-actions>
  <button mat-button [mat-dialog-close]="false">Cancel</button>
  <button mat-button [mat-dialog-close]="true" class="mat-warn" cdkFocusInitial>Delete</button>
</mat-dialog-actions>
`,
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
})
class DeleteLootDialog {
  readonly data = inject<DeleteData>(MAT_DIALOG_DATA);
}
