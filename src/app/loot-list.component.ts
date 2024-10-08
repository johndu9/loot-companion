import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import { Loot, LootType, Pool } from "./loot.defs";
import { MatChipsModule } from "@angular/material/chips";
import { LootCardComponent } from "./loot-card.component";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatInputModule } from '@angular/material/input';
import { LootService } from "./loot.service";
import { combineLatest, Subject, takeUntil } from "rxjs";

export const SCROLL_TOP_THRESHOLD = 500;

@Component({
  selector: 'loot-list',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatSidenavModule, MatIconModule, MatChipsModule, LootCardComponent],
  templateUrl: './loot-list.component.html',
  styleUrl: './loot-list.component.scss'
})
export class LootListComponent implements OnDestroy, AfterViewInit {

  private readonly unsubscribe$ = new Subject<void>();

  loots: Loot[] = [];
  pools: Pool[] = [];

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

  @Input()
  isButtonWarn: boolean = false;

  @Output()
  buttonPressed = new EventEmitter<{name: string, index: number}>();

  @ViewChild('lootListDiv')
  el!: ElementRef;

  get element(): HTMLElement {
    return this.el.nativeElement;
  }

  canScrollTop: boolean = false;

  filterTypes: LootType[] = [];
  filterSources: string[] = [];
  filterPools: string[] = [];
  showFilter: boolean = true;

  selectedTypes: LootType[] | false = false;
  selectedSources: string[] | false = false;
  selectedPools: string[] | false = false;
  name: string = '';
  description: string = '';

  constructor(lootService: LootService) {
    combineLatest([lootService.loots$, lootService.pools$]).pipe(takeUntil(this.unsubscribe$)).subscribe(([loots, pools]) => {
      this.loots = loots;
      this.pools = pools;
      this.filterTypes = [...new Set(loots.map(l => l.type))];
      this.filterSources = [...new Set(loots.map(l => l.sourcePool))];
      this.filterPools = pools.map(p => p.name);
      this.selectedTypes = [...this.filterTypes].filter(t => this.selectedTypes ? this.selectedTypes.includes(t) : true);
      this.selectedSources = [...this.filterSources].filter(t => this.selectedSources ? this.selectedSources.includes(t) : true);
      this.selectedPools = [...this.filterPools].filter(t => this.selectedPools ? this.selectedPools.includes(t) : true);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  ngAfterViewInit(): void {
    this.el.nativeElement.addEventListener('scroll', () => {
      this.canScrollTop = this.el.nativeElement.scrollTop > SCROLL_TOP_THRESHOLD;
    });
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
      const inSelectedFilters = (this.selectedTypes ? this.selectedTypes.includes(loot.type) : true)
        && (this.selectedSources ? this.selectedSources.includes(loot.sourcePool) : true)
        && (this.pools.filter(p => this.selectedPools ? this.selectedPools.includes(p.name) : false).flatMap(p => p.loots).includes(index));
      const n = this.name.toLowerCase();
      const d = this.description.toLowerCase();
      const hasName = loot.name.toLowerCase().includes(n);
      const hasDesc = [loot.basic, loot.charged, loot.description].join().toLowerCase().includes(d);
      return hidden || !(inSelectedFilters && hasName && hasDesc);
    }
    return hidden;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
    this.scrollTop();
  }

  scrollTop() {
    const parent = this.element.parentElement;
    if (parent && parent.offsetTop > 64) {
      // Desktop browser needs the delay
      setTimeout(() =>
        parent.parentElement?.scroll({top: parent.offsetTop - 64, behavior: "smooth"}), 1);
    } else {
      this.element.scroll({top: 0, behavior: "smooth"});
    }
  }
}
