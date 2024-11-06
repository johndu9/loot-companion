import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Loot, LootType } from "../../loot.defs";
import { NgIf, NgClass } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { md } from "../../loot.service";

export interface LootCardButtonInfo {
  text: string;
  icon?: string;
  isWarn?: boolean;
}

@Component({
  selector: 'loot-card',
  standalone: true,
  imports: [NgIf, NgClass, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './loot-card.component.html',
  styleUrl: './loot-card.component.scss'
})
export class LootCardComponent implements OnInit {

  @Input({required: true})
  loot!: Loot;

  @Input()
  isCharged: boolean = true;

  @Input()
  buttonInfos: LootCardButtonInfo[] = [];

  @Output()
  buttonPressed = new EventEmitter<string>();

  descriptionHtml: string = '';
  basicHtml: string = '';
  chargedHtml: string = '';

  get cardTraits(): string {
    if (this.loot.type === LootType.CONSUMABLE) {
      if (this.loot.sourcePool !== 'Consumable') {
        return `${this.loot.sourcePool} ${this.loot.type}`;
      }
    }
    return this.loot.sourcePool;
  }

  get hasBasic(): boolean {
    return this.loot.basic.length > 0;
  }

  get hasCharged(): boolean {
    return this.loot.charged.length > 0;
  }

  get hasDescription(): boolean {
    return this.loot.description.length > 0;
  }

  async ngOnInit() {
    await this.refreshBody();
  }

  async refreshBody() {
    // the uponSanitizeElement hook is expensive when run from dom, use fields instead
    this.descriptionHtml = await md(this.loot.description);
    this.basicHtml = await md(this.loot.basic);
    this.chargedHtml = await md(this.loot.charged);
  }

  typeToIcon(type: LootType) {
    switch (type) {
      case LootType.WEAPON:
        return 'swords';
      case LootType.CLOTHING:
        return 'apparel';
      case LootType.MAGIC_ITEM:
        return 'diamond';
      case LootType.CONSUMABLE:
        return 'science';
      default:
        return 'question_mark';
    }
  }

  typeToClass(type: LootType) {
    return type.replace(' ', '-').toLowerCase();
  }
}
