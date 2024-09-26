import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { Loot, Pool } from "./loot.defs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { LootListComponent } from "./loot-list.component";
import { combineLatest, Subject, takeUntil } from "rxjs";
import { LootService } from "./loot.service";
import { NotFoundComponent } from "./not-found.component";
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";

enum PoolViewMode {
  ViewLoot,
  AddLoot,
  RemoveLoot,
}

@Component({
  selector: 'pool',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, LootListComponent, NotFoundComponent],
  templateUrl: './pool.component.html',
  styleUrl: './pool.component.scss'
})
export class PoolComponent implements OnDestroy, OnInit {

  private readonly unsubscribe$ = new Subject<void>();

  @Input({required: true})
  poolIndex!: number;

  get pool(): Pool {
    return this.pools[this.poolIndex];
  }
  get inPool(): boolean[] {
    return this.loots.map((l, i) => this.pool.loots.includes(i));
  }
  get canDeletePool() {
    return this.loots.findIndex(l => l.sourcePool === this.pool.name) < 0
  }

  loots: Loot[] = [];
  pools: Pool[] = [];

  mode: PoolViewMode = PoolViewMode.ViewLoot;
  m = PoolViewMode;

  constructor(private lootService: LootService, private router: Router) {
  }

  ngOnInit(): void {
    combineLatest([this.lootService.loots$, this.lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([loots, pools]) => {
      this.loots = loots;
      this.pools = pools;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  modeToHidden(mode: PoolViewMode) {
    switch (mode) {
      case PoolViewMode.ViewLoot:
      case PoolViewMode.RemoveLoot:
        return this.inPool.map(i => !i);
      case PoolViewMode.AddLoot:
        return this.inPool;
    }
  }

  modeToButtonText(mode: PoolViewMode): string[] | string {
    switch (mode) {
      case PoolViewMode.RemoveLoot: {
        return this.loots.map((l, i) =>
          this.lootService.poolIndexOfLoot(i) === this.poolIndex &&
          l.sourcePool === this.pool.name ?
          '' : 'Remove');
      }
      case PoolViewMode.AddLoot: return 'Add';
      default: return '';
    }
  }

  modeToButtonIcon(mode: PoolViewMode): string[] | string {
    const buttonText = this.modeToButtonText(mode);
    if (buttonText.includes('Remove')) {
      return (buttonText as string[]).map(t => t === 'Remove' ? 'remove' : '');
    } else if (buttonText.includes('Add')) {
      return 'add';
    } else {
      return '';
    }
  }

  onSelect(event: {name: string, index: number}) {
    if (this.pool) {
      switch (this.mode) {
        case PoolViewMode.RemoveLoot: {
          this.lootService.moveLootToPool(event.index, this.pools.findIndex(p => this.loots[event.index].sourcePool === p.name));
          break;
        }
        case PoolViewMode.AddLoot: {
          this.lootService.chargeLoot(event.index);
          this.lootService.moveLootToPool(event.index, this.poolIndex);
          break;
        }
      }
    }
  }

  readonly dialog = inject(MatDialog);

  deletePool() {
    const dialogRef = this.dialog.open(DeletePoolDialog,
      {data: {poolName: this.pool.name}});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['']);
        this.lootService.removePool(this.poolIndex);
      }
    });
  }
}

interface DeletePoolData {
  poolName: string;
}

@Component({
  selector: 'delete-pool-dialog',
  template: `
<span mat-dialog-title>Deleting {{data.poolName}}</span>
<mat-dialog-content>
  <span class="mat-body-medium">Are you sure?</span>
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
    MatDialogClose
  ],
})
class DeletePoolDialog {
  readonly data = inject<DeletePoolData>(MAT_DIALOG_DATA);
}
