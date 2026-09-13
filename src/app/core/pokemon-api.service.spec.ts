import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PokemonApiService } from './pokemon-api.service';

describe('PokemonApiService', () => {
  let service: PokemonApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokemonApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getPokemonList usa /pokemon com limit e offset como params', () => {
    service.getPokemonList(12, 24).subscribe();

    const request = httpMock.expectOne({
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon?limit=12&offset=24',
    });
    request.flush({ count: 1302, next: null, previous: null, results: [] });
  });

  it('getPokemon usa /pokemon/{identifier} sem params extras', () => {
    service.getPokemon('pikachu').subscribe();

    const request = httpMock.expectOne({
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
    });
    request.flush({ id: 25, name: 'pikachu', height: 4, weight: 60, types: [] });
  });

  it('segunda chamada ao mesmo pokemon vem do cache (sem rede)', () => {
    service.getPokemon('pikachu').subscribe();
    httpMock
      .expectOne({ method: 'GET', url: 'https://pokeapi.co/api/v2/pokemon/pikachu' })
      .flush({ id: 25, name: 'pikachu', height: 4, weight: 60, types: [] });

    let result: number | undefined;
    service.getPokemon('pikachu').subscribe((detail) => {
      result = detail.id;
    });

    expect(result).toBe(25);
  });

  it('getTypeDetail usa /type/{name}', () => {
    service.getTypeDetail('fire').subscribe();

    const request = httpMock.expectOne({
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/type/fire',
    });
    request.flush({ id: 10, name: 'fire', pokemon: [] });
  });
});