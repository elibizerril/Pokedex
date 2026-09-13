import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { PokemonCard } from '../../components/pokemon-card/pokemon-card';
import { PokemonSearch } from '../../components/pokemon-search/pokemon-search';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { NamedApiResource } from '../../models/pokemon-api.models';
import {
  PokemonFilterState,
  PokemonListState,
  PokemonSearchState,
  computeOffset,
  mapPokemonListToCards,
  mapPokemonToCard,
  mapTypeToCards,
  normalizeSearchQuery,
} from '../../models/pokemon.models';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.html',
  styleUrl: './pokedex.scss',
  imports: [PokemonCard, PokemonSearch],
})
export class Pokedex {
  readonly pageSize = 12;
  readonly page = signal(1);
  readonly state = signal<PokemonListState>({ status: 'loading' });
  readonly searchQuery = signal('');
  readonly searchState = signal<PokemonSearchState>({ status: 'idle' });
  readonly hintOpen = signal(false);
  readonly filterState = signal<PokemonFilterState>({ status: 'idle' });
  readonly activeType = signal<string | null>(null);
  readonly types = signal<NamedApiResource[]>([]);

  readonly offset = computed(() => computeOffset(this.page(), this.pageSize));
  readonly canGoPrevious = computed(() => this.page() > 1);
  readonly canGoNext = computed(() => {
    const current = this.state();
    return current.status === 'success' && this.offset() + this.pageSize < current.totalCount;
  });
  readonly totalPages = computed(() => {
    const current = this.state();
    return current.status === 'success' ? Math.ceil(current.totalCount / this.pageSize) : 1;
  });

  private readonly searchInput$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly pokemonApi = inject(PokemonApiService);

  constructor() {
    this.load();

    this.pokemonApi
      .getTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) =>
          this.types.set(response.results.filter((type) => type.name !== 'unknown' && type.name !== 'shadow')),
        error: () => this.types.set([]),
      });

    this.searchInput$
      .pipe(
        debounceTime(300),
        map((raw) => {
          const query = normalizeSearchQuery(raw);
          return query !== null && query.length < 2 ? null : query;
        }),
        distinctUntilChanged(),
        tap((query) => {
          if (query !== null) {
            this.searchQuery.set(query);
          }
        }),
        switchMap((query) =>
          query === null ? of<PokemonSearchState>({ status: 'idle' }) : this.performSearch(query),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((newState) => {
        this.clearFilter();
        this.searchState.set(newState);
      });
  }

  load(): void {
    this.state.set({ status: 'loading' });
    this.pokemonApi.getPokemonList(this.pageSize, this.offset()).subscribe({
      next: (response) =>
        this.state.set({
          status: 'success',
          pokemons: mapPokemonListToCards(response),
          totalCount: response.count,
        }),
      error: () => this.state.set({ status: 'error', message: 'Não foi possível carregar os dados agora.' }),
    });
  }

  goToPage(page: number): void {
    this.page.set(page);
    window.scrollTo({ top: 0 });
    this.load();
  }

  onTyping(raw: string): void {
    this.searchInput$.next(raw);
  }

  retrySearch(): void {
    this.performSearch(this.searchQuery())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newState) => this.searchState.set(newState));
  }

  resetSearch(): void {
    this.searchState.set({ status: 'idle' });
    this.searchQuery.set('');
  }

  applyTypeFilter(typeName: string | null): void {
    this.resetSearch();
    if (typeName === null || typeName === '') {
      this.activeType.set(null);
      this.clearFilter();
      return;
    }
    this.activeType.set(typeName);
    this.performTypeFilter(typeName);
  }

  clearFilter(): void {
    this.activeType.set(null);
    this.filterState.set({ status: 'idle' });
  }

  retryFilter(): void {
    const typeName = this.activeType();
    if (typeName !== null) {
      this.performTypeFilter(typeName);
    }
  }

  private performTypeFilter(typeName: string): void {
    this.filterState.set({ status: 'loading' });
    this.pokemonApi.getTypeDetail(typeName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) =>
          this.filterState.set({
            status: 'success',
            typeName: response.name,
            pokemons: mapTypeToCards(response),
          }),
        error: () =>
          this.filterState.set({ status: 'error', message: 'Não foi possível carregar os dados agora.' }),
      });
  }

  private performSearch(query: string): Observable<PokemonSearchState> {
    return this.pokemonApi.getPokemon(query).pipe(
      map((detail): PokemonSearchState => ({ status: 'success', pokemon: mapPokemonToCard(detail) })),
      catchError((error: HttpErrorResponse) =>
        of<PokemonSearchState>(
          error.status === 404
            ? { status: 'notFound' }
            : { status: 'error', message: 'Não foi possível carregar os dados agora.' },
        ),
      ),
    );
  }
}