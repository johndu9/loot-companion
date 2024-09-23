import { Routes } from '@angular/router';
import { PlayerComponent } from './player.component';
import { LootListComponent } from './loot-list.component';

export const routes: Routes = [
  { path: 'player/:id', component: PlayerComponent },
  { path: 'browse', component: LootListComponent,
    data: {
      canFilter: true,
      hidden: [],
      charged: [],
      buttonText: '',
      buttonIcon: ''
    } },
  { path: '', redirectTo: 'browse', pathMatch: 'full' }
];
