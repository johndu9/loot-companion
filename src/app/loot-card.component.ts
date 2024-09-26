import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Loot, LootType } from "./loot.defs";
import { NgIf, NgClass } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { marked } from "marked";
import DOMPurify from "dompurify";

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
  buttonIcon: string = '';

  @Input()
  buttonText: string = '';

  @Input()
  isButtonWarn: boolean = false;

  @Output()
  select = new EventEmitter<string>();

  descriptionHtml: string = '';
  basicHtml: string = '';
  chargedHtml: string = '';

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

  async ngOnInit() {
    // the uponSanitizeElement hook is expensive when run from dom, use fields instead
    this.descriptionHtml = await this.md(this.loot.description);
    this.basicHtml = await this.md(this.loot.basic);
    this.chargedHtml = await this.md(this.loot.charged);
  }

  async md(input: string) {
    const output = await marked.parse(input);
    // replace <p> with <span> for CSS purposes
    DOMPurify.addHook("uponSanitizeElement",
      (n) => {
        if (n.tagName?.toLowerCase() === 'p' && n.parentNode) {
          n.outerHTML = n.outerHTML.replace(/^<p(.*)p>$/, '<span$1span>');
        }
      }
    );
    return DOMPurify.sanitize(output, { ALLOWED_TAGS: ['span', 'em'] });
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
