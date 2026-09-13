import {
  PokemonDetailResponse,
  PokemonListResponse,
  TypeDetailResponse,
} from './pokemon-api.models';

export interface PokemonCardModel {
  id: number;
  name: string;
  imageUrl: string;
}

export type PokemonListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pokemons: PokemonCardModel[]; totalCount: number };

export type PokemonSearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error'; message: string }
  | { status: 'success'; pokemon: PokemonCardModel };

export type PokemonFilterState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pokemons: PokemonCardModel[]; typeName: string };

export interface PokemonDetailModel {
  id: number;
  name: string;
  imageUrl: string;
  heightMeters: number;
  weightKg: number;
  types: string[];
}

export type PokemonDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pokemon: PokemonDetailModel };

export function pokemonIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

export function computeOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

export function normalizeSearchQuery(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.length === 0 ? null : trimmed;
}

export function mapPokemonToCard(detail: PokemonDetailResponse): PokemonCardModel {
  return {
    id: detail.id,
    name: detail.name,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${detail.id}.png`,
  };
}

export function mapPokemonToDetail(detail: PokemonDetailResponse): PokemonDetailModel {
  return {
    id: detail.id,
    name: detail.name,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${detail.id}.png`,
    heightMeters: detail.height / 10,
    weightKg: detail.weight / 10,
    types: detail.types.map((typeRef) => typeRef.type.name),
  };
}

export function mapPokemonListToCards(response: PokemonListResponse): PokemonCardModel[] {
  return response.results.map((item) => {
    const id = pokemonIdFromUrl(item.url);
    return {
      id,
      name: item.name,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    };
  });
}

export function mapTypeToCards(response: TypeDetailResponse): PokemonCardModel[] {
  return response.pokemon.map((entry) => {
    const id = pokemonIdFromUrl(entry.pokemon.url);
    return {
      id,
      name: entry.pokemon.name,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    };
  });
}