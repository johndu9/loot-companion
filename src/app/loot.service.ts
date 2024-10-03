import { Injectable } from '@angular/core';
import { DEFAULT_LOOTS, Loot, Player, Pool } from './loot.defs';
import { BehaviorSubject } from 'rxjs';

const LOOT_NAME = 'lootDefs';
const POOL_NAME = 'poolDefs';
const PLAYER_NAME = 'playerDefs';

interface AppDef {
  lootDefs: Loot[];
  poolDefs: Pool[];
  playerDefs: Player[];
}

export enum ImportMode {
  UpdateAndAdd = 'Update and Add',
  AddNewLootOnly = 'Add New Loot Only',
  Override = 'Override'
}

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

  private lootsToSourcePools(loots: Loot[]): Pool[] {
    const sources = [...new Set(loots.map(l => l.sourcePool))];
    return sources.map(s => new Pool(s, loots.reduce((acc: number[], l, i) => l.sourcePool === s ? [...acc, i] : acc, [])));
  }

  resetDefs() {
    const ls = DEFAULT_LOOTS;
    const sourcePools = this.lootsToSourcePools(ls);
    const initialPools = this.fromSourcePoolsToInitialPools(sourcePools);
    this._loots.next(ls);
    this._pools.next(initialPools);
    this._players.next([]);
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

  removePlayer(playerIndex: number) {
    const playerPoolIndex = this.players[playerIndex].pool;
    this._pools.next(this.returnLootToSources(playerPoolIndex).filter((p, i) => i !== playerPoolIndex));
    this._players.next(this.players.filter((p, i) => i !== playerIndex));
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

  removePool(poolIndex: number) {
    const pool = this.pools[poolIndex];
    const hasSourceLoot = this.loots.findIndex(l => l.sourcePool === pool.name) >= 0;
    const isPlayerPool = this.players.map(p => p.pool).includes(poolIndex);
    if (hasSourceLoot) {
      console.error('Pool has loot with "' + pool.name + '" as source, delete its loot first');
    } else if (isPlayerPool) {
      console.error('Pool belongs to player, delete player instead');
    } else {
      this._pools.next(this.returnLootToSources(poolIndex).filter((p, i) => i !== poolIndex));
      this._players.next(this.players.map(p => p.pool > poolIndex ? {...p, pool: p.pool - 1} as Player : p));
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

  private getAppBlob() {
    const lootDefs = JSON.parse(localStorage.getItem(LOOT_NAME) ?? '');
    const poolDefs = JSON.parse(localStorage.getItem(POOL_NAME) ?? '');
    const playerDefs = JSON.parse(localStorage.getItem(PLAYER_NAME) ?? '');
    const appDef: AppDef = { lootDefs, poolDefs, playerDefs };
    const str = JSON.stringify(appDef);
    const bytes = new TextEncoder().encode(str);
    return new Blob([bytes], { type: "application/json;charset=UTF-8" });
  }

  export() {
    const blob = this.getAppBlob();
    const a: HTMLAnchorElement = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    const url: string = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'LOOT-Squire.json';
    a.click();
    window.URL.revokeObjectURL(url);
    a.parentElement?.removeChild(a);
  }

  import(file: File, importMode: ImportMode = ImportMode.Override) {
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = () => {
      const result = (fileReader.result ?? '') as string;
      const appDef = JSON.parse(result) as AppDef;
      if (appDef && appDef.lootDefs && appDef.poolDefs && appDef.playerDefs) {
        switch (importMode) {
          case ImportMode.Override: {
            this._loots.next(appDef.lootDefs);
            this._pools.next(appDef.poolDefs);
            this._players.next(appDef.playerDefs);
            break;
          }
          case ImportMode.AddNewLootOnly: {
            const oldLoots = [...this.loots];
            const newToCombinedMap = new Map<number, number>();
            const foundIndices: number[] = [];
            let notFound = 0;
            appDef.lootDefs.forEach((nl, ni) => {
              const iInOld = oldLoots.findIndex((ol, oi) => JSON.stringify(ol) === JSON.stringify(nl) && !foundIndices.includes(oi));
              if (iInOld >= 0) {
                newToCombinedMap.set(ni, iInOld);
                foundIndices.push(iInOld);
              } else {
                newToCombinedMap.set(ni, this.loots.length + notFound);
                notFound = notFound + 1;
              }
            });
            const newLoots = appDef.lootDefs.filter((l, i) => (newToCombinedMap.get(i) ?? 0) >= this.loots.length);
            const newLootsPoolNames = newLoots.map(l => l.sourcePool);
            const combinedLoots = [...this.loots, ...newLoots];
            const combinedSourcePools = this.lootsToSourcePools(combinedLoots);
            const newSourcePools = combinedSourcePools.filter(cp => this.pools.findIndex(p => cp.name === p.name) < 0);
            const updatedPools = this.pools.map(p => {
              if (newLootsPoolNames.includes(p.name)) {
                const newLootFromPool = combinedLoots.reduce((acc: number[], l, i) => (l.sourcePool === p.name && i >= this.loots.length) ? [...acc, i] : acc, []);
                return new Pool(p.name, [...p.loots, ...newLootFromPool]);
              } else {
                return p;
              }
            });
            const combinedPools = [...updatedPools, ...newSourcePools];
            this._loots.next(combinedLoots);
            this._pools.next(combinedPools);
            break;
          }
          case ImportMode.UpdateAndAdd: {
            const oldLoots = [...this.loots];
            const newToCombinedMap = new Map<number, number>();
            const foundIndices: number[] = [];
            let notFound = 0;
            appDef.lootDefs.forEach((nl, ni) => {
              const iInOld = oldLoots.findIndex((ol, oi) => JSON.stringify(ol) === JSON.stringify(nl) && !foundIndices.includes(oi));
              if (iInOld >= 0) {
                newToCombinedMap.set(ni, iInOld);
                foundIndices.push(iInOld);
              } else {
                newToCombinedMap.set(ni, this.loots.length + notFound);
                notFound = notFound + 1;
              }
            });
            const newLoots = appDef.lootDefs.filter((l, i) => (newToCombinedMap.get(i) ?? 0) >= this.loots.length);
            const combinedLoots = [...this.loots, ...newLoots];
            // use appDef as source of truth for updating existing config
            const updatedNewPools = appDef.poolDefs.map(p => new Pool(p.name, p.loots.map(l => newToCombinedMap.get(l) ?? 0)));
            const newPoolsLoots = new Set(updatedNewPools.flatMap(p => p.loots));
            const updatedOldPools = this.pools.map(op => {
              const newPoolLoots = updatedNewPools.find(np => np.name === op.name)?.loots ?? [];
              const oldPoolLoots = op.loots.filter(l => !newPoolsLoots.has(l));
              return new Pool(op.name, [...oldPoolLoots, ...newPoolLoots]);
            });
            const onlyNewPools = updatedNewPools.filter(np => this.pools.findIndex(op => op.name === np.name) < 0);
            const combinedPools = [...updatedOldPools, ...onlyNewPools];
            const updatedNewPlayers = appDef.playerDefs.map(p => {
              return {
                ...p,
                drained: p.drained.map(l => newToCombinedMap.get(l) ?? 0),
                pool: combinedPools.findIndex(pool => pool.name === p.name)
              } as Player;
            });
            const updatedOldPlayers = this.players.map(op => {
              const newPlayerIndex = updatedNewPlayers.findIndex(np => np.name === op.name);
              if (newPlayerIndex >= 0) {
                return updatedNewPlayers[newPlayerIndex];
              } else {
                return {
                  ...op,
                  pool: combinedPools.findIndex(pool => pool.name === op.name)
                } as Player;
              }
            });
            const onlyNewPlayers = updatedNewPlayers.filter(np => this.players.findIndex(op => op.name === np.name) < 0);
            const combinedPlayers = [...updatedOldPlayers, ...onlyNewPlayers];
            this._loots.next(combinedLoots);
            this._pools.next(combinedPools);
            this._players.next(combinedPlayers);
            break;
          }
        }
      }
    }
    fileReader.onerror = (error) => {
      console.error(error);
    }
  }

  private returnLootToSources(fromPoolIndex: number) {
    const fromPool = this.pools[fromPoolIndex];
    const lootIndices = fromPool.loots;
    const sourceNames = [...new Set(lootIndices.map(l => this.loots[l].sourcePool))];
    const sourceIndices = sourceNames.map(s => this.pools.findIndex(p => p.name === s));
    const replaceValues = sourceIndices.map(sourceIndex => {
      const sourcePool = this.pools[sourceIndex];
      const lootToSource = lootIndices.filter(l => this.loots[l].sourcePool === sourcePool.name);
      return {
        index: sourceIndex,
        value: new Pool(sourcePool.name, [...sourcePool.loots, ...lootToSource])
      };
    });
    replaceValues.push({index: fromPoolIndex, value: new Pool(fromPool.name, [])});
    return this.replaceN(this.pools, replaceValues);
  }

  private replace<T>(arr: Array<T>, index: number, newValue: T) {
    return [...arr].map((v, i) => i === index ? newValue : v);
  }

  private replaceN<T>(arr: Array<T>, newValues: {index: number, value: T}[]) {
    const is = newValues.map(n => n.index);
    const vs = newValues.map(n => n.value);
    return [...arr].map((v, i) => is.includes(i) ? vs[is.indexOf(i)] : v);
  }

  private saveDefs(name: string, value: Array<Loot | Pool | Player>) {
    const json = JSON.stringify(value);
    localStorage.setItem(name, json);
  }
}
