import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonCardModel } from '../../models/pokemon.models';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.scss',
  imports: [RouterLink],
})
export class PokemonCard {
  readonly pokemon = input.required<PokemonCardModel>();

  readonly fallbackImage =
    `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' ` +
    `width='96' height='96'><rect width='96' height='96' fill='%23e0e0e0'/>` +
    `<text x='50%25' y='50%25' fill='%23909090' font-size='28' ` +
    `text-anchor='middle' dominant-baseline='middle'>?</text></svg>`;

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.fallbackImage;
  }
}