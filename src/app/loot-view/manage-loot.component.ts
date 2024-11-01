import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LootListButtonData, LootListComponent } from './common/loot-list.component';
import { LootService } from '../loot.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../dialog/confirm-dialog.component';
import { LootCardButtonInfo } from './common/loot-card.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Loot, Pool } from '../loot.defs';
import { AddLootData, AddLootDialogComponent } from '../dialog/add-loot.component';

@Component({
  selector: 'manage-loot',
  standalone: true,
  imports: [LootListComponent],
  template: `
<loot-list
  [buttonInfos]="buttons"
  (buttonPressed)="deleteLoot($event)"
  />
`
})
export class ManageLootComponent implements OnDestroy, OnInit {
  loots: Loot[] = [];
  nonPlayerPools: Pool[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  constructor(private lootService: LootService) { }

  ngOnInit(): void {
    this.lootService.loots$.pipe(takeUntil(this.unsubscribe$)).subscribe(loots => this.loots = loots);
    combineLatest([this.lootService.players$, this.lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([players, pools]) => {
      this.nonPlayerPools = pools.filter((pool, i) => !players.map(player => player.pool).includes(i));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  readonly dialog = inject(MatDialog);
  readonly buttons: LootCardButtonInfo[] = [
    {icon: 'edit', text: 'Edit'},
    {icon: 'delete_forever', text: 'Delete', isWarn: true}
  ];

  deleteLoot(event: LootListButtonData) {
    const loot = this.loots[event.index];
    switch (event.buttonText) {
      case 'Edit': {
        const data: AddLootData = {
          poolNames: this.nonPlayerPools.map(p => p.name),
          loot
        };
        const dialogRef = this.dialog.open(AddLootDialogComponent, { data });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.lootService.updateLootDef(event.index, result);
          }
        });
        break;
      }
      case 'Delete': {
        const pool = this.lootService.poolOfLoot(event.index);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
          title: `Deleting ${loot.name}`,
          description: `${pool ? pool.name : ''} has ${loot.name}. Are you sure?`,
          buttonText: 'Delete',
          isWarn: true
        } as ConfirmDialogData });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.lootService.removeLootDef(event.index);
          }
        });
        break;
      }
    }
  }
}
