import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { Loot, Player, PlayerStat, Pool } from "../loot.defs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { LootListButtonData, LootListComponent } from "./common/loot-list.component";
import { combineLatest, Subject, takeUntil } from "rxjs";
import { LootService } from "../loot.service";
import { NotFoundComponent } from "../not-found.component";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { LootListInfoButtonComponent } from "./common/loot-list-info-button.component";
import { LootListInfoComponent } from "./common/loot-list-info.component";
import { ConfirmDialogComponent, ConfirmDialogData } from "../dialog/confirm-dialog.component";
import { LootCardButtonInfo } from "./common/loot-card.component";
import { AddPlayerData, AddPlayerDialogComponent } from "../dialog/add-player.component";
import { TransferLootData, TransferLootDialogComponent } from "../dialog/transfer-loot.component";

enum PlayerViewMode {
  ViewLoot,
  AddLoot
}

const useChargeButton: LootCardButtonInfo = {text: 'Use Charge', icon: 'bolt'};
const restoreChargeButton: LootCardButtonInfo = {text: 'Restore Charge', icon: 'replay'};
const transferButton: LootCardButtonInfo = {text: 'Transfer', icon: 'move_item'};
const addButton: LootCardButtonInfo = {text: 'Add', icon: 'add'};

@Component({
  selector: 'player',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, LootListComponent, NotFoundComponent, LootListInfoButtonComponent, LootListInfoComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnDestroy, OnInit {

  private readonly unsubscribe$ = new Subject<void>();

  @Input({required: true, transform: (id: string | number) => { return +id; }})
  playerIndex!: number;

  get player(): Player {
    return this.players[this.playerIndex];
  }
  statTypes = [PlayerStat.Health, PlayerStat.Armor, PlayerStat.Force, PlayerStat.Flow, PlayerStat.Focus];
  stat = PlayerStat;
  p = Player;

  get inPlayerPool(): boolean[] {
    return this.loots.map((l, i) => this.pools[this.player.pool].loots.includes(i));
  }
  get charged(): boolean[] {
    return this.loots.map((l, i) => !this.player.drained.includes(i));
  }

  loots: Loot[] = [];
  pools: Pool[] = [];
  players: Player[] = [];

  mode: PlayerViewMode = PlayerViewMode.ViewLoot;
  m = PlayerViewMode;

  get isGood() {
    return this.statTypes.map(s =>
      this.player ?
        Player.getCurrent(this.player, s) >= Player.getMax(this.player, s) &&
        Player.getMax(this.player, s) > 0
      : false);
  }
  get isWarn() {
    return this.statTypes.map(s =>
      this.player ?
        Player.getCurrent(this.player, s) < Player.getMax(this.player, s) &&
        Player.getCurrent(this.player, s) > 0 &&
        Player.getMax(this.player, s) > 0
      : false);
  }
  get isBad() {
    return this.statTypes.map(s =>
      this.player ?
        Player.getCurrent(this.player, s) <= 0 ||
        Player.getMax(this.player, s) <= 0
      : false);
  }

  constructor(private lootService: LootService, private router: Router) {}

  ngOnInit(): void {
    combineLatest([this.lootService.players$, this.lootService.loots$, this.lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([players, loots, pools]) => {
      this.players = players;
      this.loots = loots;
      this.pools = pools;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }
  
  modeToHidden(mode: PlayerViewMode) {
    switch (mode) {
      case PlayerViewMode.ViewLoot:
        return this.inPlayerPool.map(i => !i);
      case PlayerViewMode.AddLoot:
        return this.inPlayerPool;
    }
  }

  modeToButtonInfos(mode: PlayerViewMode): LootCardButtonInfo[][] {
    switch (mode) {
      case PlayerViewMode.ViewLoot:
        return this.loots.map((l, i): LootCardButtonInfo[] => {
          if (l.charged) {
            if (this.inPlayerPool[i]) {
              if (this.charged[i]) {
                return [useChargeButton, transferButton];
              } else {
                return [restoreChargeButton, transferButton];
              }
            }
          }
          return [transferButton];
        })
      case PlayerViewMode.AddLoot:
        return new Array(this.loots.length).fill([addButton]);
    }
  }

  onSelect(event: LootListButtonData) {
    if (this.player) {
      const pi = this.pools[this.player.pool].loots.findIndex(l => l === event.index);
      switch (event.buttonText) {
        case useChargeButton.text: {
          if (pi >= 0) {
            this.lootService.drainLoot(event.index);
          }
          break;
        }
        case restoreChargeButton.text: {
          if (pi >= 0) {
            this.lootService.chargeLoot(event.index);
          }
          break;
        }
        case transferButton.text: {
          if (pi >= 0) {
            this.transferLoot(event.index);
          }
          break;
        }
        case addButton.text: {
          this.lootService.moveLootToPool(event.index, this.pools.findIndex((p, i) => (this.player?.pool ?? -1) === i));
          break;
        }
      }
    }
  }

  incStat(stat: PlayerStat, isMax: boolean, addValue: number) {
    if (this.player) {
      this.lootService.addToStat(this.playerIndex, isMax ? Player.indexOfMax(stat) : Player.indexOfCurrent(stat), addValue);
    }
  }

  statToIcon(stat: PlayerStat) {
    switch(stat) {
      case PlayerStat.Health:
        return 'favorite';
      case PlayerStat.Armor:
        return 'shield';
      case PlayerStat.Force:
        return 'weight';
      case PlayerStat.Flow:
        return 'airwave';
      case PlayerStat.Focus:
        return 'cognition';
    }
  }

  readonly dialog = inject(MatDialog);

  transferLoot(lootIndex: number) {
    const data: TransferLootData = {
      loot: this.loots[lootIndex],
      currentPool: this.pools[this.player.pool],
      pools: this.pools
    }
    const dialogRef = this.dialog.open(TransferLootDialogComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const targetIndex = result as number;
        this.lootService.moveLootToPool(lootIndex, targetIndex);
      }
    });
  }

  editPlayer() {
    const data: AddPlayerData = { player: this.player, pools: this.pools };
    const dialogRef = this.dialog.open(AddPlayerDialogComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lootService.updatePlayer(this.playerIndex, result);
      }
    });
  }

  deletePlayer() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
      title: `Deleting ${this.player.name}`,
      description: 'Are you sure?',
      buttonText: 'Delete',
      isWarn: true
    } as ConfirmDialogData });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['']);
        this.lootService.removePlayer(this.playerIndex);
      }
    });
  }
}
