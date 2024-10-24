import { Component, inject } from '@angular/core';
import { LootListComponent } from './loot-view/common/loot-list.component';
import { LootService } from './loot.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from './dialog/confirm-dialog.component';

@Component({
  selector: 'delete-loot',
  standalone: true,
  imports: [LootListComponent],
  template: `
<loot-list
  [buttonIcon]="'delete_forever'"
  [buttonText]="'Delete loot'"
  [isButtonWarn]="true"
  (buttonPressed)="deleteLoot($event)"
  />
`,
  styleUrl: './app.component.scss'
})
export class DeleteLootComponent {
  constructor(private lootService: LootService) { }

  readonly dialog = inject(MatDialog);

  deleteLoot(event: {name: string, index: number}) {
    const lootName = event.name;
    const pool = this.lootService.poolOfLoot(event.index);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
      title: `Deleting ${lootName}`,
      description: `${pool ? pool.name : ''} has ${lootName}. Are you sure?`,
      buttonText: 'Delete',
      isWarn: true
    } as ConfirmDialogData });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lootService.removeLootDef(event.index);
      }
    });
  }
}
