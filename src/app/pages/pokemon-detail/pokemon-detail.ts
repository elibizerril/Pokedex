import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { PokemonDetailState, mapPokemonToDetail } from '../../models/pokemon.models';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.html',
  styleUrl: './pokemon-detail.scss',
})
export class PokemonDetail {
  readonly id = input.required<string>();

  readonly state = signal<PokemonDetailState>({ status: 'loading' });

  private readonly pokemonApi = inject(PokemonApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    toObservable(this.id)
      .pipe(
        distinctUntilChanged(),
        switchMap((id) =>
          this.pokemonApi.getPokemon(id).pipe(
            map((detail): PokemonDetailState => ({ status: 'success', pokemon: mapPokemonToDetail(detail) })),
            catchError((error: HttpErrorResponse) =>
              of<PokemonDetailState>({
                status: 'error',
                message:
                  error.status === 404
                    ? 'Não encontramos esse Pokémon.'
                    : 'Não foi possível carregar os dados agora.',
              }),
            ),
          ),
        ),
        startWith<PokemonDetailState>({ status: 'loading' }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((newState) => this.state.set(newState));
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}