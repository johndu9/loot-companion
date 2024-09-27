import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { Router } from "@angular/router";
import { LootService } from "./loot.service";
import { Player, Pool } from "./loot.defs";
import { Subject, combineLatest, takeUntil } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { AddPlayerDialogComponent } from "./dialog/add-player.component";
import { AddPoolDialogComponent } from "./dialog/add-pool.component";
import { ConfirmResetDialogComponent } from "./dialog/confirm-reset.component";
import { AddLootData, AddLootDialogComponent } from "./dialog/add-loot.component";
import { ImportDialogComponent } from "./dialog/import.component";

@Component({
  selector: 'nav-list',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './nav-list.component.html',
  styleUrl: './nav-list.component.scss'
})
export class NavListComponent implements OnDestroy, OnInit {

  private readonly unsubscribe$ = new Subject<void>();

  readonly dialog = inject(MatDialog);

  @Output() selected = new EventEmitter<void>();

  players: Player[] = [];
  pools: Pool[] = [];
  get nonPlayerPools() {
    return this.pools.filter((pool, i) => !this.players.map(player => player.pool).includes(i));
  }

  constructor(private lootService: LootService, private router: Router) { }

  ngOnInit(): void {
    combineLatest([this.lootService.players$, this.lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([players, pools]) => {
      this.players = players;
      this.pools = pools;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  isActive(commands: Array<string | number>) {
    return this.router.isActive(commands.join('/'), {paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored'});
  }

  navigate(commands: Array<string | number>) {
    this.router.navigate(commands);
    this.selected.emit();
  }

  reset() {
    const dialogRef = this.dialog.open(ConfirmResetDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.navigate(['browse']);
        this.lootService.resetDefs();
      }
    });
  }

  addLoot() {
    const data: AddLootData = { poolNames: this.nonPlayerPools.map(p => p.name) };
    const dialogRef = this.dialog.open(AddLootDialogComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lootService.addLootDef(result);
      }
    });
  }

  addPlayer() {
    const dialogRef = this.dialog.open(AddPlayerDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const playerIndex = this.players.length;
        this.lootService.addPlayer(result);
        this.navigate(['player', playerIndex]);
      }
    });
  }

  addPool() {
    const dialogRef = this.dialog.open(AddPoolDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const poolIndex = this.pools.length;
        this.lootService.addPool(result);
        this.navigate(['pool', poolIndex]);
      }
    });
  }

  export() {
    this.lootService.export();
  }

  import() {
    const dialogRef = this.dialog.open(ImportDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.navigate(['browse']);
        this.lootService.import(result);
      }
    });
  }
}
