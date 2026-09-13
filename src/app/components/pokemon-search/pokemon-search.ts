import { Component, DestroyRef, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { NamedApiResource } from '../../models/pokemon-api.models';
import { pokemonIdFromUrl } from '../../models/pokemon.models';

@Component({
  selector: 'app-pokemon-search',
  templateUrl: './pokemon-search.html',
  styleUrl: './pokemon-search.scss',
})
export class PokemonSearch {
  readonly typed = output<string>();
  readonly hintOpen = output<boolean>();
  readonly MAX_SUGGESTIONS = 7;

  private readonly pokemonApi = inject(PokemonApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  query = '';
  suggestions: NamedApiResource[] = [];
  open = false;
  activeIndex = -1;

  private allNames: NamedApiResource[] | null = null;

  get activeId(): string {
    return this.activeIndex >= 0 ? `suggestion-${this.activeIndex}` : '';
  }

  suggestionId(url: string): string {
    return pokemonIdFromUrl(url).toString().padStart(3, '0');
  }

  onInput(value: string): void {
    this.query = value;
    this.typed.emit(value);

    if (this.allNames === null && this.query.trim().length >= 2) {
      this.loadAllNames();
      return;
    }
    this.refreshSuggestions();
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.open || this.suggestions.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.move(+1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.move(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.chooseActive();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  onBlur(): void {
    this.close();
  }

  choose(suggestion: NamedApiResource): void {
    this.close();
    this.router.navigate(['/pokemon', pokemonIdFromUrl(suggestion.url)]);
  }

  private loadAllNames(): void {
    this.pokemonApi
      .getAllPokemonNames()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (names) => {
          this.allNames = names;
          this.refreshSuggestions();
        },
      });
  }

  private refreshSuggestions(): void {
    const trimmed = this.query.trim().toLowerCase();
    this.suggestions =
      trimmed.length >= 2 && this.allNames !== null
        ? this.allNames.filter((item) => item.name.startsWith(trimmed)).slice(0, this.MAX_SUGGESTIONS)
        : [];
    this.open = this.suggestions.length > 0;
    this.activeIndex = this.suggestions.length > 0 ? 0 : -1;
    this.hintOpen.emit(this.open);
  }

  private move(step: number): void {
    const length = this.suggestions.length;
    this.activeIndex = (this.activeIndex + step + length) % length;
  }

  private chooseActive(): void {
    const suggestion = this.suggestions[this.activeIndex];
    if (suggestion) {
      this.choose(suggestion);
    }
  }

  private close(): void {
    this.open = false;
    this.activeIndex = -1;
    this.hintOpen.emit(false);
  }
}