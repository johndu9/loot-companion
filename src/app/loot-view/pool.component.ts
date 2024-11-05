import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { Loot, Pool } from "../loot.defs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { LootListButtonData, LootListComponent } from "./common/loot-list.component";
import { combineLatest, Subject, takeUntil } from "rxjs";
import { LootService, md } from "../loot.service";
import { NotFoundComponent } from "../not-found.component";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { LootListInfoComponent } from "./common/loot-list-info.component";
import { LootListInfoButtonComponent } from "./common/loot-list-info-button.component";
import { ConfirmDialogComponent, ConfirmDialogData } from "../dialog/confirm-dialog.component";
import { LootCardButtonInfo } from "./common/loot-card.component";
import { AddPoolData, AddPoolDialogComponent } from "../dialog/add-pool.component";
import { AsyncPipe } from "@angular/common";

enum PoolViewMode {
  ViewLoot,
  AddLoot
}

const removeButton: LootCardButtonInfo = {text: 'Remove', icon: 'remove', isWarn: true};
const addButton: LootCardButtonInfo = {text: 'Add', icon: 'add'};

@Component({
  selector: 'pool',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, LootListComponent, NotFoundComponent, LootListInfoComponent, LootListInfoButtonComponent, AsyncPipe],
  templateUrl: './pool.component.html',
  styleUrl: './pool.component.scss'
})
export class PoolComponent implements OnDestroy, OnInit, OnChanges {

  private readonly unsubscribe$ = new Subject<void>();

  @Input({required: true, transform: (id: string | number) => { return +id; }})
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
  descriptionHtml: string = '';

  constructor(private lootService: LootService, private router: Router) {
  }

  ngOnInit(): void {
    combineLatest([this.lootService.loots$, this.lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(async ([loots, pools]) => {
      this.loots = loots;
      this.pools = pools;
      await this.refreshDescription();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['poolIndex']) {
      await this.refreshDescription();
    }
  }

  async refreshDescription() {
    this.descriptionHtml = await md(this.pool?.description ?? '');
  }

  modeToHidden(mode: PoolViewMode) {
    switch (mode) {
      case PoolViewMode.ViewLoot:
        return this.inPool.map(i => !i);
      case PoolViewMode.AddLoot:
        return this.inPool;
    }
  }

  modeToButtonInfos(mode: PoolViewMode): LootCardButtonInfo[][] {
    switch (mode) {
      case PoolViewMode.ViewLoot:
        return this.loots.map(l => {
          return l.sourcePool === this.pool.name ? [] : [removeButton];
        });
      case PoolViewMode.AddLoot:
        return new Array(this.loots.length).fill([addButton]);
    }
  }

  onSelect(event: LootListButtonData) {
    if (this.pool) {
      switch (event.buttonText) {
        case removeButton.text: {
          this.removeLoot(event.index);
          break;
        }
        case addButton.text: {
          this.lootService.chargeLoot(event.index);
          this.lootService.moveLootToPool(event.index, this.poolIndex);
          break;
        }
      }
    }
  }

  readonly dialog = inject(MatDialog);

  editPool() {
    const data: AddPoolData = { pool: this.pool, pools: this.pools };
    const dialogRef = this.dialog.open(AddPoolDialogComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lootService.updatePool(this.poolIndex, result);
      }
    });
  }

  deletePool() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
      title: `Deleting ${this.pool.name}`,
      description: 'Are you sure?',
      buttonText: 'Delete',
      isWarn: true
    } as ConfirmDialogData });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['']);
        this.lootService.removePool(this.poolIndex);
      }
    });
  }

  removeLoot(lootIndex: number) {
    const loot = this.loots[lootIndex];
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
      title: `Moving ${loot.name} from ${this.pool.name} to ${loot.sourcePool}`,
      description: 'Are you sure?',
      buttonText: 'Remove',
      isWarn: true
    } as ConfirmDialogData });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lootService.moveLootToPool(lootIndex, this.pools.findIndex(p => loot.sourcePool === p.name));
      }
    });
  }
}
