import {
  PokemonDetailResponse,
  PokemonListResponse,
  TypeDetailResponse,
} from './pokemon-api.models';
import {
  computeOffset,
  mapPokemonListToCards,
  mapPokemonToCard,
  mapPokemonToDetail,
  mapTypeToCards,
  normalizeSearchQuery,
  pokemonIdFromUrl,
} from './pokemon.models';

const detailResponse: PokemonDetailResponse = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  types: [
    { slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } },
  ],
};

const listResponse: PokemonListResponse = {
  count: 1302,
  next: 'https://pokeapi.co/api/v2/pokemon?offset=12&limit=12',
  previous: null,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
  ],
};

const typeResponse: TypeDetailResponse = {
  id: 10,
  name: 'fire',
  pokemon: [{ pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' } }],
};

describe('mapPokemonToDetail', () => {
  it('converte height/weight para metro e quilo (decímetros e hectogramas da API)', () => {
    const result = mapPokemonToDetail(detailResponse);

    expect(result.heightMeters).toBe(0.4);
    expect(result.weightKg).toBe(6);
  });

  it('deriva imagem, id e tipos', () => {
    const result = mapPokemonToDetail(detailResponse);

    expect(result.id).toBe(25);
    expect(result.name).toBe('pikachu');
    expect(result.imageUrl).toContain('/25.png');
    expect(result.types).toEqual(['electric']);
  });
});

describe('mapPokemonToCard', () => {
  it('usa id e nome do detalhe', () => {
    const result = mapPokemonToCard(detailResponse);

    expect(result).toEqual({
      id: 25,
      name: 'pikachu',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    });
  });
});

describe('listToCards / typeToCards', () => {
  it('deriva id a partir do fim da URL da lista', () => {
    const cards = mapPokemonListToCards(listResponse);

    expect(cards[0]).toMatchObject({ id: 1, name: 'bulbasaur' });
    expect(cards[1]).toMatchObject({ id: 2, name: 'ivysaur' });
  });

  it('deriva id a partir do fim da URL do tipo', () => {
    const cards = mapTypeToCards(typeResponse);

    expect(cards[0]).toMatchObject({ id: 4, name: 'charmander' });
  });
});

describe('pokemonIdFromUrl', () => {
  it('extrai o id mesmo com barra final', () => {
    expect(pokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });
});

describe('normalizeSearchQuery', () => {
  it('remove espaços das bordas e minúsculas', () => {
    expect(normalizeSearchQuery('  Pikachu  ')).toBe('pikachu');
  });

  it('retorna null para vazio ou só espaços', () => {
    expect(normalizeSearchQuery('   ')).toBeNull();
    expect(normalizeSearchQuery('')).toBeNull();
  });
});

describe('computeOffset', () => {
  it('página 1 começa no offset 0', () => {
    expect(computeOffset(1, 12)).toBe(0);
  });

  it('página 3 com pageSize 12 desloca 24', () => {
    expect(computeOffset(3, 12)).toBe(24);
  });

  it('página 5 com pageSize 20 desloca 80', () => {
    expect(computeOffset(5, 20)).toBe(80);
  });
});