import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PokemonListResponse, TypeListResponse } from '../../models/pokemon-api.models';
import { Pokedex } from './pokedex';

const listResponse: PokemonListResponse = {
  count: 1302,
  next: null,
  previous: null,
  results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
};

const typeListResponse: TypeListResponse = {
  results: [
    { name: 'fire', url: 'https://pokeapi.co/api/v2/type/10/' },
    { name: 'unknown', url: 'https://pokeapi.co/api/v2/type/10001/' },
    { name: 'shadow', url: 'https://pokeapi.co/api/v2/type/10002/' },
  ],
};

describe('Pokedex — busca', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Pokedex],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  function mount() {
    const fixture = TestBed.createComponent(Pokedex);
    fixture.detectChanges();

    httpMock
      .expectOne({ method: 'GET', url: 'https://pokeapi.co/api/v2/pokemon?limit=12&offset=0' })
      .flush(listResponse);
    httpMock.expectOne({ method: 'GET', url: 'https://pokeapi.co/api/v2/type' }).flush(typeListResponse);

    return fixture.componentInstance;
  }

  it('404 vira estado notFound (não erro genérico) e limpa o filtro', () => {
    const component = mount();

    vi.useFakeTimers();
    component.onTyping('zzz');
    vi.advanceTimersByTime(300);

    const searchRequest = httpMock.expectOne({
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon/zzz',
    });
    searchRequest.flush(null, { status: 404, statusText: 'Not Found' });

    expect(component.searchState()).toEqual({ status: 'notFound' });
    expect(component.activeType()).toBeNull();
  });

  it('busca com menos de 2 caracteres não dispara requisição', () => {
    const component = mount();

    vi.useFakeTimers();
    component.onTyping('p');
    vi.advanceTimersByTime(500);

    expect(component.searchState()).toEqual({ status: 'idle' });
  });

  it('successo na busca vira estado success', () => {
    const component = mount();

    vi.useFakeTimers();
    component.onTyping('pikachu');
    vi.advanceTimersByTime(300);

    const searchRequest = httpMock.expectOne({
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
    });
    searchRequest.flush({ id: 25, name: 'pikachu', height: 4, weight: 60, types: [] });

    expect(component.searchState()).toEqual({
      status: 'success',
      pokemon: {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      },
    });
  });
});