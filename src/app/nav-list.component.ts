import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { Router } from "@angular/router";
import { LootService } from "./loot.service";
import { Player, Pool } from "./loot.defs";
import { Subject, takeUntil } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { AddPlayerData, AddPlayerDialogComponent } from "./dialog/add-player.component";
import { AddPoolData, AddPoolDialogComponent } from "./dialog/add-pool.component";
import { AddLootData, AddLootDialogComponent } from "./dialog/add-loot.component";
import { ImportData, ImportDialogComponent } from "./dialog/import.component";
import { ConfirmDialogComponent, ConfirmDialogData } from "./dialog/confirm-dialog.component";

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
  sources = new Set<string>();
  get nonPlayerPools() {
    const playerPools = this.players.map(player => player.pool);
    return this.pools.filter((pool, i) => !playerPools.includes(i));
  }
  get sourcePools() {
    return this.pools.filter(p => this.sources.has(p.name));
  }
  get collectionPools() {
    return this.nonPlayerPools.filter(p => !this.sourcePools.includes(p));
  }
  get addablePools() {
    return [...this.sourcePools, ...this.collectionPools.filter(p => p.loots.length === 0)];
  }

  constructor(private lootService: LootService, private router: Router) { }

  ngOnInit(): void {
    this.lootService.players$.pipe(takeUntil(this.unsubscribe$)).subscribe(players => this.players = players);
    this.lootService.pools$.pipe(takeUntil(this.unsubscribe$)).subscribe(pools => this.pools = pools);
    this.lootService.loots$.pipe(takeUntil(this.unsubscribe$)).subscribe(loots => this.sources = new Set(loots.map(l => l.sourcePool)));
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
      title: 'Reset LOOT Squire',
      description: 'This will reset loot, character, and pools to defaults. Are you sure?',
      buttonText: 'Reset',
      isWarn: true
    } as ConfirmDialogData });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.navigate(['browse']);
        this.lootService.resetDefs();
      }
    });
  }

  addLoot() {
    const data: AddLootData = { poolNames: this.addablePools.map(p => p.name) };
    const dialogRef = this.dialog.open(AddLootDialogComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lootService.addLootDef(result);
      }
    });
  }

  addPlayer() {
    const data: AddPlayerData = { pools: this.pools };
    const dialogRef = this.dialog.open(AddPlayerDialogComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const player = result as Player;
        const playerIndex = this.players.length;
        this.lootService.addPlayer(player.name);
        this.navigate(['player', playerIndex]);
      }
    });
  }

  addPool() {
    const data: AddPoolData = { pools: this.pools };
    const dialogRef = this.dialog.open(AddPoolDialogComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const pool = result as Pool;
        const poolIndex = this.pools.length;
        this.lootService.addPool(pool.name, pool.description);
        this.navigate(['pool', poolIndex]);
      }
    });
  }

  export() {
    this.lootService.export();
  }

  import() {
    const dialogRef = this.dialog.open(ImportDialogComponent);
    dialogRef.afterClosed().subscribe((result: ImportData) => {
      if (result) {
        this.navigate(['browse']);
        this.lootService.import(result.file, result.mode);
      }
    });
  }
}
