export enum LootType {
  WEAPON = 'Weapon',
  CLOTHING = 'Clothing',
  MAGIC_ITEM = 'Magic Item',
  CONSUMABLE = 'Consumable'
}

export enum LootSource {
  INITIATE = 'Initiate',
  CONSUMABLE = 'Consumable',
  STARTER = 'Starter',
  CITY = 'City'
}

export class Loot {
  public basic: string;
  public charged: string;
  public description: string;
  constructor (
    public name: string,
    public type: LootType,
    public sourcePool: LootSource,
    { basic, charged, description }: { basic?: string, charged?: string, description?: string }
  ) {
    this.basic = basic ?? '';
    this.charged = charged ?? '';
    this.description = description ?? '';
  }
}

export class Consumable extends Loot {
  constructor (
    name: string,
    description: string
  ) {
    super(name, LootType.CONSUMABLE, LootSource.CONSUMABLE, { description: description });
  }
}

enum PlayerStat {
  HEALTH = 0,
  ARMOR = 1,
  FORCE = 2,
  FLOW = 3,
  FOCUS = 4
}

export class Player {
  constructor (
    public name: string,
    private stats: number[] = [2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    private loot: any = {}
  ) {}

  private getMax(stat: PlayerStat) { return this.stats[stat * 2]; }
  private setMax(stat: PlayerStat, value: number) { this.stats[stat * 2] = value; }
  private getCurrent(stat: PlayerStat) { return this.stats[stat * 2 + 1]; }
  private setCurrent(stat: PlayerStat, value: number) { this.stats[stat * 2 + 1] = value; }
  get healthMax() { return this.getMax(PlayerStat.HEALTH); }
  set healthMax(value: number) { this.setMax(PlayerStat.HEALTH, value); }
  get healthCurrent() { return this.getCurrent(PlayerStat.HEALTH); }
  set healthCurrent(value: number) { this.setCurrent(PlayerStat.HEALTH, value); }
  get armorMax() { return this.getMax(PlayerStat.ARMOR); }
  set armorMax(value: number) { this.setMax(PlayerStat.ARMOR, value); }
  get armorCurrent() { return this.getCurrent(PlayerStat.ARMOR); }
  set armorCurrent(value: number) { this.setCurrent(PlayerStat.ARMOR, value); }
  get forceMax() { return this.getMax(PlayerStat.FORCE); }
  set forceMax(value: number) { this.setMax(PlayerStat.FORCE, value); }
  get forceCurrent() { return this.getCurrent(PlayerStat.FORCE); }
  set forceCurrent(value: number) { this.setCurrent(PlayerStat.FORCE, value); }
  get flowMax() { return this.getMax(PlayerStat.FLOW); }
  set flowMax(value: number) { this.setMax(PlayerStat.FLOW, value); }
  get flowCurrent() { return this.getCurrent(PlayerStat.FLOW); }
  set flowCurrent(value: number) { this.setCurrent(PlayerStat.FLOW, value); }
  get focusMax() { return this.getMax(PlayerStat.FOCUS); }
  set focusMax(value: number) { this.setMax(PlayerStat.FOCUS, value); }
  get focusCurrent() { return this.getCurrent(PlayerStat.FOCUS); }
  set focusCurrent(value: number) { this.setCurrent(PlayerStat.FOCUS, value); }
  addLoot(lootName: string) { this.setLootCharge(lootName, true); }
  setLootCharge(lootName: string, isCharged: boolean) { this.loot[lootName] = isCharged; }
  isCharged(lootName: string) { return this.loot[lootName]; }
  removeLoot(lootName: string) { delete this.loot[lootName]; }
}

export const DEFAULT_LOOTS: Loot[] = [
  new Loot('Simple Sword', LootType.WEAPON, LootSource.INITIATE, {
    basic: 'Range 1, Harm 1',
    charged: 'Range 1, Harm 2'
  }),
  new Loot('Shield', LootType.WEAPON, LootSource.INITIATE, {
    charged: 'Range 1, *Stuns* enemy (-1 action next turn)',
    description: '+1 Armor'
  }),
  new Loot('Flame Aura', LootType.WEAPON, LootSource.INITIATE, {
    charged: 'Range 1-2. Deal 1 Harm to ALL characters within range.'}),
  new Loot('Bow', LootType.WEAPON, LootSource.INITIATE, {
    basic: 'Range 3, Harm 1.',
    charged: 'Harm 1 to all enemies in a straight line up to 3 spaces from you.'
  }),
  new Loot('Dagger', LootType.WEAPON, LootSource.INITIATE, {
    basic: 'Range 0, Harm 1',
    charged: 'Range 2, Harm 2'}),
  new Loot('Magic Missile', LootType.WEAPON, LootSource.INITIATE, {
    basic: 'Range 2-3, Harm 1',
    charged: 'Range 2-3, Harm 1, choose up to 3 targets'
  }),
  new Loot('Shiv', LootType.WEAPON, LootSource.INITIATE, {
    basic: 'Range 1, Harm 1',
    charged: 'Range 1, Harm 1, *Bleed* (1 Harm start of each turn)'
  }),
  new Loot('Razor Trap', LootType.WEAPON, LootSource.INITIATE, {
    charged: 'Choose an empty space at Range 1 to place the trap.\n\nThe next enemy that moves onto that space takes Harm 2.'
  }),
  new Loot('Iron Plate', LootType.CLOTHING, LootSource.INITIATE, {
    description: '+3 Health, +1 Armor'
  }),
  new Loot('Cloak', LootType.CLOTHING, LootSource.INITIATE, {
    description: '+2 Health, +1 Armor\n\n+1 Flow'
  }),
  new Loot('Robe', LootType.CLOTHING, LootSource.INITIATE, {
    description: '+1 Health\n\n+1 Flow\n\n+2 Focus'
  }),
  new Loot('Hunters Vest', LootType.CLOTHING, LootSource.INITIATE, {
    description: '+3 Health\n\n+1 Force'
  }),
  new Loot('Giants Ring', LootType.MAGIC_ITEM, LootSource.INITIATE, {
    description: '+1 Health\n\n+1 Force'
  }),
  new Loot('Owl Stone', LootType.MAGIC_ITEM, LootSource.INITIATE, {
    description: '+1 Flow'
  }),
  new Loot('Time Orb', LootType.MAGIC_ITEM, LootSource.INITIATE, {
    charged: 'You and one ally within Range 2 may reset all of your drained loot (except this one).'
  }),
  new Loot('Lure', LootType.MAGIC_ITEM, LootSource.INITIATE, {
    charged: 'Range 4-5. Choose an enemy. They will move in a straight line towards you up to their movement.'
  }),
  new Consumable('Healing Potion',
    'Range 0-1 (if used in combat).\n\nRecover 3 Health.'),
  new Consumable('Patch Kit',
    'Range 0-1 (if used in combat).\n\nRecover 1 Armor.'),
  new Consumable('Quick Camp',
    'All party members recover 1 of any Approach.\n\nCannot be used during combat.'),
  new Consumable('Smoke Bomb',
    'Range 1\n\nStuns enemies at range the rest (-1 action during turn)'),
  new Consumable('Liquid Shield',
    'Range 0\n\nProvides you with 2 Armor for a fight.'),
  new Consumable('Silken Tonic',
    'Temporarily grants the ability to climb on walls and ceilings.'),
  new Consumable('Beast Friend',
    'Nearby creatures will provided temporary assistance to you.'),
  new Loot('Iron Spear', LootType.WEAPON, LootSource.STARTER, {
    basic: 'Range 2, Harm 1',
    charged: 'Move 1, Range 2, Harm 3'
  }),
  new Loot('Tower Shield', LootType.WEAPON, LootSource.STARTER, {
    description: '+1 Health, +2 Armor'
  }),
  new Loot('Sling', LootType.WEAPON, LootSource.STARTER, {
    basic: 'Range 2-3, Harm 1',
    charged: 'Range 2-3, Harm 1, *AOE* (Harm all characters Range 1 from target).'
  }),
  new Loot('Simple Crossbow', LootType.WEAPON, LootSource.STARTER, {
    basic: 'Range 3-4, Harm 1',
    charged: '2 Harm to all enemies in a straight line from you'
  }),
  new Loot('Delver Armor', LootType.CLOTHING, LootSource.STARTER, {
    description: '+1 Health, +1 Armor\n\n+1 Force, +1 Flow, +1 Focus'
  }),
  new Loot('Scholars Robes', LootType.CLOTHING, LootSource.STARTER, {
    description: '+3 Focus'
  }),
  new Loot('Simple Plate', LootType.CLOTHING, LootSource.STARTER, {
    description: '+2 Health, +2 Armor\n\n+1 Force'
  }),
  new Loot('Skulking Cloak', LootType.CLOTHING, LootSource.STARTER, {
    description: '+2 Flow, +1 Focus'
  }),
  new Loot('Amulet of Body', LootType.MAGIC_ITEM, LootSource.STARTER, {
    description: '+3 Health'
  }),
  new Loot('Amplifier', LootType.MAGIC_ITEM, LootSource.STARTER, {
    description: 'Choose any number on a piece of loot you have equipped.\n\nIncrease it +1.'
  }),
  new Loot('Lying Cat', LootType.MAGIC_ITEM, LootSource.STARTER, {
    description: 'As long as you have more than 1 Focus remaining, you can always detect when someone is lying to you.'
  }),
  new Loot('Silken Scarf', LootType.MAGIC_ITEM, LootSource.STARTER, {
    description: 'As long as you have more than 1 Flow remaining, you can walk on walls.'
  }),
  new Loot('Banish', LootType.WEAPON, LootSource.CITY, {
    charged: 'Range 1. Target disappears from the grid. They return to their same space at the end of the next round.'
  }),
  new Loot('Inferno', LootType.WEAPON, LootSource.CITY, {
    charged: 'Deal 2 Harm to all characters (except you) who share the same row and column as you.'
  }),
  new Loot('Axe', LootType.WEAPON, LootSource.CITY, {
    basic: 'Range 1, Harm 1',
    charged: 'Range 1, Harm 1, affects all enemies in range.'
  }),
  new Loot('Hammer', LootType.WEAPON, LootSource.CITY, {
    basic: 'Range 1, Harm 2',
    charged: '1 Harm to all enemies in a straight line up to 3 spaces away.'
  }),
  new Loot('Tahnlian Scale', LootType.CLOTHING, LootSource.CITY, {
    description: '+3 Health, +1 Armor\n\n+1 Force, +1 Flow, +1 Focus'
  }),
  new Loot('Spectral Shirt', LootType.CLOTHING, LootSource.CITY, {
    description: '+0 Health, +1 Armor\n\n-1 Force, +3 Flow\n\nOnce per quest, you may walk through any solid wall.'
  }),
  new Loot('Shapers Shirt', LootType.CLOTHING, LootSource.CITY, {
    charged: 'Tunnel through the ground, moving to any other open space on the grid.',
    description: '+2 Health, +1 Armor'
  }),
  new Loot('Pact Bound Hide', LootType.CLOTHING, LootSource.CITY, {
    charged: 'Use 1 Focus. You may recover 3 Health.',
    description: '+1 Health\n\n+1 Flow, +2 Focus'
  }),
  new Loot('Remixer', LootType.MAGIC_ITEM, LootSource.CITY, {
    description: 'You may freely move points between your Health and your Approaches at any time.'
  }),
  new Loot('Skull of Lore', LootType.MAGIC_ITEM, LootSource.CITY, {
    description: '+2 Focus'
  }),
  new Loot('Blink Ring', LootType.MAGIC_ITEM, LootSource.CITY, {
    charged: 'Move to any empty space on the grid. It must be at least 4 spaces away.'
  }),
  new Loot('Healing Orb', LootType.MAGIC_ITEM, LootSource.CITY, {
    charged: 'Heals ALL characters 2 within Range 3.'
  })
];
