import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Loot, LootType, Player } from "./loot.defs";
import { MatChipsModule } from "@angular/material/chips";
import { LootCardComponent, LootCardType } from "./loot-card.component";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'loot-list',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, MatChipsModule, LootCardComponent],
  templateUrl: './loot-list.component.html',
  styleUrl: './loot-list.component.scss'
})
export class LootListComponent implements OnInit {
  ngOnInit(): void {
    this.filterTypes = [...new Set(this.loots.map(l => l.type))];
    this.filterSources = [...new Set(this.loots.map(l => l.sourcePool))];
    this.selectedTypes = [...this.filterTypes];
    this.selectedSources = [...this.filterSources];
  }
  @Input({required: true})
  loots!: Loot[];

  @Input({required: true})
  cardType!: LootCardType;

  @Input()
  player: Player | undefined;

  @Input()
  isFilterable: boolean = true;

  @Output()
  select = new EventEmitter<string>();

  filterTypes: LootType[] = [];
  filterSources: string[] = [];

  selectedTypes: LootType[] = [];
  selectedSources: string[] = [];
  name: string = '';
  description: string = '';

  isLootHidden(loot: Loot) {
    if (this.player) {
      return !this.player.hasLoot(loot.name);
    }
    if (this.isFilterable) {
      const inSelectedFilters = this.selectedTypes.includes(loot.type) && this.selectedSources.includes(loot.sourcePool);
      const n = this.name.toLowerCase();
      const d = this.description.toLowerCase();
      const hasName = loot.name.toLowerCase().includes(n);
      const hasDesc = [loot.basic, loot.charged, loot.description].join().toLowerCase().includes(d);
      return !(inSelectedFilters && hasName && hasDesc);
    }
    return false;
  }

  setCharge(lootName: string, charged: boolean) {
    if (this.player) {
      if (this.player.hasLoot(lootName)) {
        this.player.setLootCharged(lootName, charged);
      }
    }
  }

  // TODO: make loot-filter a sidenav
}
