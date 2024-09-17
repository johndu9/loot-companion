import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { Loot, LootType } from "./loot.defs";
import { NgIf, NgClass } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { marked } from "marked";
import DOMPurify from "dompurify";

export enum LootCardType {
  CHARGE = 'charge',
  SELECT = 'select',
  DISPLAY_ONLY = 'display-only'
}

@Component({
  selector: 'loot-card',
  standalone: true,
  imports: [NgIf, NgClass, MatCardModule, MatButtonModule, MatIconModule],
  encapsulation: ViewEncapsulation.ShadowDom, // needed for span spacing
  templateUrl: './loot-card.component.html',
  styleUrl: './loot-card.component.scss'
})
export class LootCardComponent {

  @Input({required: true})
  loot!: Loot;

  @Input({required: true})
  cardType!: LootCardType;

  @Input()
  isCharged: boolean = true;

  @Output()
  useCharge = new EventEmitter<string>();

  @Output()
  restoreCharge = new EventEmitter<string>();

  @Output()
  select = new EventEmitter<string>();

  t = LootCardType;

  get cardTraits(): string {
    if (this.loot.type === LootType.CONSUMABLE) {
      return this.loot.type;
    } else {
      return (this.loot.type).concat(', ', this.loot.sourcePool);
    }
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

  get hasFooter(): boolean {
    return this.cardType === LootCardType.SELECT || (this.cardType === LootCardType.CHARGE && this.hasCharged);
  }

  md(input: string) {
    const output = marked.parse(input, { async: false });
    return DOMPurify.sanitize(output, { ALLOWED_TAGS: ['p', 'em'] });
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
