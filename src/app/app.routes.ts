import { Routes } from '@angular/router';
import { PlayerComponent } from './loot-view/player.component';
import { ManageLootComponent } from './loot-view/manage-loot.component';
import { PoolComponent } from './loot-view/pool.component';
import { AboutComponent } from './about.component';
import { NotFoundComponent } from './not-found.component';

export const routes: Routes = [
  { path: 'player/:playerIndex', component: PlayerComponent },
  { path: 'pool/:poolIndex', component: PoolComponent },
  { path: 'browse', component: ManageLootComponent },
  { path: 'about', component: AboutComponent },
  { path: '', redirectTo: 'browse', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];
