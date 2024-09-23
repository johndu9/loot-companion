import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Loot, Player, PlayerStat, Pool } from "./loot.defs";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { LootListComponent } from "./loot-list.component";
import { combineLatest, Subject, takeUntil } from "rxjs";
import { LootService } from "./loot.service";

enum PlayerViewMode {
  ViewLoot,
  AddLoot,
  RemoveLoot,
}

@Component({
  selector: 'player',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, LootListComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnDestroy, OnInit {

  private readonly unsubscribe$ = new Subject<void>();

  @Input({required: true, alias: 'id'})
  playerIndex!: number;

  player?: Player;
  statTypes = [PlayerStat.Health, PlayerStat.Armor, PlayerStat.Force, PlayerStat.Flow, PlayerStat.Focus];
  stat = PlayerStat;
  p = Player;

  inPlayerPool: boolean[] = [];
  inSourcePool: boolean[] = [];
  charged: boolean[] = [];
  canFilter: boolean = false;

  loots: Loot[] = [];
  pools: Pool[] = [];

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

  constructor(public lootService: LootService) {
  }

  ngOnInit(): void {
    combineLatest([this.lootService.players$, this.lootService.loots$, this.lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([players, loots, pools]) => {
      const player = players[this.playerIndex];
      this.player = player;
      this.loots = loots;
      this.pools = pools;
      if (player) {
        this.inPlayerPool = loots.map((l, i) => pools[player.pool].loots.includes(i));
        this.inSourcePool = loots.map((l, i) => pools.find(p => p.name === l.sourcePool)?.loots.includes(i) ?? false);
        this.charged = loots.map((l, i) => !player.drained.includes(i));
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }
  
  modeToHidden(mode: PlayerViewMode) {
    switch (mode) {
      case PlayerViewMode.ViewLoot:
      case PlayerViewMode.RemoveLoot:
        return this.inPlayerPool.map(i => !i);
      case PlayerViewMode.AddLoot:
        return this.inSourcePool.map(i => !i);
    }
  }

  modeToButtonText(mode: PlayerViewMode) {
    switch (mode) {
      case PlayerViewMode.ViewLoot:
        return this.loots.map((l, i) => {
          if (l.charged) {
            if (this.inPlayerPool[i]) {
              if (this.charged[i]) {
                return 'Use charge';
              } else {
                return 'Restore charge';
              }
            }
          }
          return '';
        })
      case PlayerViewMode.RemoveLoot:
        return new Array(this.loots.length).fill('Remove');
      case PlayerViewMode.AddLoot:
        return new Array(this.loots.length).fill('Add');
    }
  }

  modeToButtonIcon(mode: PlayerViewMode) {
    return this.modeToButtonText(mode).map(t => {
      switch (t) {
        case 'Use charge': return 'bolt';
        case 'Restore charge': return 'replay';
        case 'Remove': return 'remove';
        case 'Add': return 'add';
        default: return '';
      }
    })
  }

  onSelect(event: {name: string, index: number}) {
    if (this.player) {
      const pi = this.pools[this.player.pool].loots.findIndex(l => l === event.index);
      switch (this.mode) {
        case PlayerViewMode.ViewLoot: {
          if (pi >= 0) {
            const c = this.charged[event.index];
            if (c) {
              this.lootService.drainLoot(event.index);
            } else {
              this.lootService.chargeLoot(event.index);
            }
          }
          break;
        }
        case PlayerViewMode.RemoveLoot: {
          if (pi >= 0) {
            this.lootService.chargeLoot(event.index);
            this.lootService.moveLootToPool(event.index, this.pools.findIndex(p => this.loots[event.index].sourcePool === p.name));
          }
          break;
        }
        case PlayerViewMode.AddLoot: {
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
}
