import { Routes } from '@angular/router';
import { Pokedex } from './pages/pokedex/pokedex';
import { PokemonDetail } from './pages/pokemon-detail/pokemon-detail';

export const routes: Routes = [
  { path: '', component: Pokedex },
  { path: 'pokemon/:id', component: PokemonDetail },
];

export default routes;
