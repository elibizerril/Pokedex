export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface PokemonTypeRef {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeRef[];
}

export interface TypeListResponse {
  results: NamedApiResource[];
}

export interface TypePokemonEntry {
  pokemon: NamedApiResource;
}

export interface TypeDetailResponse {
  id: number;
  name: string;
  pokemon: TypePokemonEntry[];
}