import { Routes } from '@angular/router';
import { PlayerComponent } from './player.component';
import { LootListComponent } from './loot-list.component';
import { DeleteLootComponent } from './delete-loot.component';

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
  { path: 'delete', component: DeleteLootComponent },
  { path: '', redirectTo: 'browse', pathMatch: 'full' }
];
