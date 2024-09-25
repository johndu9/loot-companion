import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { Loot, LootType } from "./loot.defs";
import { MatChipsModule } from "@angular/material/chips";
import { LootCardComponent } from "./loot-card.component";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatInputModule } from '@angular/material/input';
import { LootService } from "./loot.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: 'loot-list',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatSidenavModule, MatIconModule, MatChipsModule, LootCardComponent],
  templateUrl: './loot-list.component.html',
  styleUrl: './loot-list.component.scss'
})
export class LootListComponent implements OnDestroy {

  private readonly unsubscribe$ = new Subject<void>();

  loots: Loot[] = [];

  @Input()
  charged: boolean[] = [];

  @Input()
  hidden: boolean[] = [];

  @Input()
  canFilter: boolean = true;

  @Input()
  buttonText: string[] | string = [];

  @Input()
  buttonIcon: string[] | string = [];

  @Output()
  select = new EventEmitter<{name: string, index: number}>();

  filterTypes: LootType[] = [];
  filterSources: string[] = [];

  selectedTypes: LootType[] = [];
  selectedSources: string[] = [];
  name: string = '';
  description: string = '';

  isFilterOpen = false;

  constructor(lootService: LootService) {
    lootService.loots$.pipe(takeUntil(this.unsubscribe$)).subscribe((loots) => {
      this.loots = loots;
      this.filterTypes = [...new Set(this.loots.map(l => l.type))];
      this.filterSources = [...new Set(this.loots.map(l => l.sourcePool))];
      this.selectedTypes = [...this.filterTypes];
      this.selectedSources = [...this.filterSources];
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  indexOfArrOrString(field: string[] | string, index: number): string {
    if (field) {
      if (typeof field === 'string' || field instanceof String) {
        return field as string;
      } else if (field.length === this.loots.length) {
        return field[index];
      }
    }
    return '';
  }

  isLootHidden(loot: Loot, index: number) {
    const hidden = this.hidden ? this.hidden.length === this.loots.length && this.hidden[index] : false;
    if (this.canFilter) {
      const inSelectedFilters = this.selectedTypes.includes(loot.type) && this.selectedSources.includes(loot.sourcePool);
      const n = this.name.toLowerCase();
      const d = this.description.toLowerCase();
      const hasName = loot.name.toLowerCase().includes(n);
      const hasDesc = [loot.basic, loot.charged, loot.description].join().toLowerCase().includes(d);
      return hidden || !(inSelectedFilters && hasName && hasDesc);
    }
    return hidden;
  }

  onFilterOpened(opened: boolean) {
    this.isFilterOpen = opened;
  }
}
