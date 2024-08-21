import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DEFAULT_LOOTS, Loot } from './loot.defs.js';
import { NgFor } from '@angular/common';
import { LootCardComponent, LootCardType } from "./loot-card.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgFor, LootCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'loot-companion';
  loots: Loot[] = [];
  t = LootCardType;
  
  ngOnInit(): void {
    this.initLootDefs();
  }

  initLootDefs() {
    const defs = localStorage.getItem('lootDefs');
    if (defs) {
      this.loots = JSON.parse(defs) as Loot[];
    } else {
      this.resetLootDefs();
    }
  }

  resetLootDefs() {
    this.loots = DEFAULT_LOOTS;
    localStorage.setItem('lootDefs', JSON.stringify(this.loots));
  }
}
