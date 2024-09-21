import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LootListComponent } from "./loot-list.component";
import { PlayerComponent } from "./player.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LootListComponent, PlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'loot-companion';

  constructor() { }
}
