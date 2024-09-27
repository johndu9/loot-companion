import { AfterViewInit, Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Loot, Player, PlayerStat, Pool } from "./loot.defs";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { LootListComponent, SCROLL_TOP_THRESHOLD } from "./loot-list.component";
import { combineLatest, Subject, takeUntil } from "rxjs";
import { LootService } from "./loot.service";
import { NotFoundComponent } from "./not-found.component";
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";

enum PlayerViewMode {
  ViewLoot,
  AddLoot,
  RemoveLoot,
}

@Component({
  selector: 'player',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, LootListComponent, NotFoundComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnDestroy, OnInit, AfterViewInit {

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

  canScrollTop: boolean = false;

  @ViewChild('playerDiv')
  el!: ElementRef;

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

  constructor(private lootService: LootService, private router: Router) {
  }

  ngOnInit(): void {
    combineLatest([this.lootService.players$, this.lootService.loots$, this.lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([players, loots, pools]) => {
      this.players = players;
      this.loots = loots;
      this.pools = pools;
    });
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.addEventListener('scroll', () => {
      this.canScrollTop = this.el.nativeElement.scrollTop > SCROLL_TOP_THRESHOLD;
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
        return this.inPlayerPool;
    }
  }

  modeToButtonText(mode: PlayerViewMode): string[] | string {
    switch (mode) {
      case PlayerViewMode.ViewLoot:
        return this.loots.map((l, i) => {
          if (l.charged) {
            if (this.inPlayerPool[i]) {
              if (this.charged[i]) {
                return 'Use Charge';
              } else {
                return 'Restore Charge';
              }
            }
          }
          return '';
        })
      case PlayerViewMode.RemoveLoot:
        return 'Remove';
      case PlayerViewMode.AddLoot:
        return 'Add';
    }
  }

  modeToButtonIcon(mode: PlayerViewMode): string[] | string {
    const buttonText = this.modeToButtonText(mode);
    if (typeof buttonText === 'string' || buttonText instanceof String) {
      switch (buttonText) {
        case 'Remove': return 'remove';
        case 'Add': return 'add';
        default: return '';
      }
    } else {
      return buttonText.map(t => {
        switch (t) {
          case 'Use Charge': return 'bolt';
          case 'Restore Charge': return 'replay';
          default: return '';
        }
      });
    }
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

  scrollTop() {
    this.el.nativeElement.scroll({top: 0, behavior: "smooth"});
  }

  readonly dialog = inject(MatDialog);

  deletePlayer() {
    const dialogRef = this.dialog.open(DeletePlayerDialogComponent,
      {data: {playerName: this.player.name}});

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['']);
        this.lootService.removePlayer(this.playerIndex);
      }
    });
  }
}

interface DeletePlayerData {
  playerName: string;
}

@Component({
  selector: 'delete-player-dialog',
  template: `
<span mat-dialog-title>Deleting {{data.playerName}}</span>
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
class DeletePlayerDialogComponent {
  readonly data = inject<DeletePlayerData>(MAT_DIALOG_DATA);
}
