import { Injectable } from '@angular/core';
import { DEFAULT_LOOTS, Loot, Player, Pool } from './loot.defs';
import { BehaviorSubject } from 'rxjs';

const LOOT_NAME = 'lootDefs';
const POOL_NAME = 'poolDefs';
const PLAYER_NAME = 'playerDefs';

@Injectable({
  providedIn: 'root'
})
export class LootService {

  private _loots = new BehaviorSubject(new Array<Loot>(0));
  loots$ = this._loots.asObservable();
  private _pools = new BehaviorSubject(new Array<Pool>(0));
  pools$ = this._pools.asObservable();
  private _players = new BehaviorSubject(new Array<Player>(0));
  players$ = this._players.asObservable();

  private get loots() { return this._loots.value; }
  private get pools() { return this._pools.value; }
  private get players() { return this._players.value; }

  constructor() {
    const lootDefs = localStorage.getItem(LOOT_NAME);
    const poolDefs = localStorage.getItem(POOL_NAME);
    const playerDefs = localStorage.getItem(PLAYER_NAME);
    const hasDefs = lootDefs && poolDefs && playerDefs;
    if (hasDefs) {
      this._loots.next(JSON.parse(lootDefs) as Loot[]);
      this._pools.next(JSON.parse(poolDefs) as Pool[]);
      this._players.next(JSON.parse(playerDefs) as Player[]);
      this.setupSaveSubscriptions()
    } else {
      this.setupSaveSubscriptions()
      this.resetDefs();
    }
  }

  private setupSaveSubscriptions() {
    this.loots$.subscribe(loots => this.saveDefs(LOOT_NAME, loots));
    this.pools$.subscribe(pools => this.saveDefs(POOL_NAME, pools));
    this.players$.subscribe(players => this.saveDefs(PLAYER_NAME, players));
  }

  private fromSourcePoolsToInitialPools(sourcePools: Pool[]): Pool[] {
    const initiatePoolIndex = sourcePools.findIndex(p => p.name === 'Initiate');
    const starterPoolIndex = sourcePools.findIndex(p => p.name === 'Starter');
    const consumablePoolIndex = sourcePools.findIndex(p => p.name === 'Consumable');
    const playerPool = new Pool('Loot Pool', [...sourcePools[initiatePoolIndex].loots, ...sourcePools[starterPoolIndex].loots]);
    const consumablePool = new Pool('Consumable Pool', [...sourcePools[consumablePoolIndex].loots]);
    const newSourcePools = this.replaceN(sourcePools,
      [initiatePoolIndex, starterPoolIndex, consumablePoolIndex]
      .map(i => { return { index: i, value: new Pool(sourcePools[i].name, []) }; }));
    return [playerPool, consumablePool, ...newSourcePools];
  }

  resetDefs() {
    const ls = DEFAULT_LOOTS;
    const sources = [...new Set(ls.map(l => l.sourcePool))];
    const sourcePools = sources.map(s => new Pool(s, ls.reduce((acc: number[], l, i) => l.sourcePool === s ? [...acc, i] : acc, [])));
    const initialPools = this.fromSourcePoolsToInitialPools(sourcePools);
    this._loots.next(ls);
    this._pools.next(initialPools);
    this._players.next([]);
    this.addPlayer('John Loot');
  }

  addLootDef(loot: Loot) {
    const lootIndex = this.loots.length;
    this._loots.next([...this.loots, loot]);

    const poolIndex = this.pools.findIndex(p => p.name === loot.sourcePool);
    if (poolIndex >= 0) {
      const oldPool = this.pools[poolIndex];
      const newPool = Pool.addLoot(oldPool, lootIndex);
      this._pools.next(this.replace<Pool>(this.pools, poolIndex, newPool));
    } else {
      this._pools.next([...this.pools, new Pool(loot.sourcePool, [lootIndex])]);
    }
  }

  removeLootDef(lootIndex: number) {
    this._loots.next([...this.loots].filter((l, i) => i !== lootIndex));

    const poolIndex = this.poolIndexOfLoot(lootIndex);
    if (poolIndex >= 0) {
      const newPools = this.pools.map((p, i) => {
        if (i === poolIndex) {
          return Pool.adjustLootIndices(Pool.removeLoot(p, lootIndex), lootIndex);
        } else {
          return Pool.adjustLootIndices(p, lootIndex);
        }});
      this._pools.next(newPools);
    }
  }

  addPlayer(name: string) {
    if (this.pools.map(p => p.name).indexOf(name) >= 0) {
      console.error('Pool or player with name "' + name + '" already exists');
    } else {
      const poolIndex = this.pools.length;
      this.addPool(name);
      this._players.next([...this.players, new Player(name, poolIndex)]);
    }
  }

  drainLoot(lootIndex: number) {
    const poolIndex = this.poolIndexOfLoot(lootIndex);
    if (poolIndex >= 0) {
      const playerIndex = this.players.findIndex(p => p.pool === poolIndex);
      const oldPlayer = this.players[playerIndex];
      if (!oldPlayer.drained.includes(lootIndex)) {
        const newPlayer = Player.addDrained(oldPlayer, lootIndex);
        this._players.next(this.replace<Player>(this.players, playerIndex, newPlayer));
      }
    }
  }

  chargeLoot(lootIndex: number) {
    const poolIndex = this.poolIndexOfLoot(lootIndex);
    if (poolIndex >= 0) {
      const playerIndex = this.players.findIndex(p => p.pool === poolIndex);
      if (playerIndex >= 0) {
        const oldPlayer = this.players[playerIndex];
        if (oldPlayer.drained.includes(lootIndex)) {
          const newPlayer = Player.removeDrained(oldPlayer, lootIndex);
          this._players.next(this.replace<Player>(this.players, playerIndex, newPlayer));
        }
      }
    }
  }

  addToStat(playerIndex: number, statIndex: number, addValue: number) {
    const newPlayer = Player.addStat(this.players[playerIndex], statIndex, addValue);
    this._players.next(this.replace<Player>(this.players, playerIndex, newPlayer));
  }

  addPool(name: string) {
    if (this.pools.map(p => p.name).indexOf(name) >= 0) {
      console.error('Pool with name "' + name + '" already exists');
    } else {
      this._pools.next([...this.pools, new Pool(name)]);
    }
  }

  moveLootToPool(lootIndex: number, poolIndex: number) {
    const fromPoolIndex = this.poolIndexOfLoot(lootIndex);

    if (fromPoolIndex >= 0) {
      const newFromPool = Pool.removeLoot(this.pools[fromPoolIndex], lootIndex);
      const newToPool = Pool.addLoot(this.pools[poolIndex], lootIndex);
      this._pools.next(this.replace<Pool>(this.replace<Pool>(this.pools, fromPoolIndex, newFromPool), poolIndex, newToPool));
    }
  }

  poolOfLoot(lootIndex: number) {
    const poolIndex = this.poolIndexOfLoot(lootIndex);
    if (poolIndex >= 0) {
      return {...this.pools[poolIndex]} as Pool;
    } else {
      return false;
    }
  }

  poolIndexOfLoot(lootIndex: number) {
    return this.pools.findIndex(p => p.loots.includes(lootIndex));
  }

  private replace<T>(arr: Array<T>, index: number, newValue: T) {
    return [...arr].map((v, i) => i === index ? newValue : v);
  }

  private replaceN<T>(arr: Array<T>, newValues: {index: number, value: T}[]) {
    const is = newValues.map(n => n.index);
    const vs = newValues.map(n => n.value);
    return [...arr].map((v, i) => is.includes(i) ? vs[is.indexOf(i)] : v);
  }

  private saveDefs(name: string, value: any) {
    const json = JSON.stringify(value);
    localStorage.setItem(name, json);
  }
}
