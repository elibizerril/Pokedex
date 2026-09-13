import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import {
  PokemonDetailResponse,
  PokemonListResponse,
  TypeDetailResponse,
  TypeListResponse,
} from '../models/pokemon-api.models';

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly detailCache = new Map<string, PokemonDetailResponse>();

  getPokemonList(limit: number, offset: number): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon`, {
      params: { limit, offset },
    });
  }

  getPokemon(identifier: string): Observable<PokemonDetailResponse> {
    const cached = this.detailCache.get(identifier);
    if (cached) {
      return of(cached);
    }
    return this.http
      .get<PokemonDetailResponse>(`${this.baseUrl}/pokemon/${identifier}`)
      .pipe(tap((response) => this.detailCache.set(identifier, response)));
  }

  getTypes(): Observable<TypeListResponse> {
    return this.http.get<TypeListResponse>(`${this.baseUrl}/type`);
  }

  getTypeDetail(name: string): Observable<TypeDetailResponse> {
    return this.http.get<TypeDetailResponse>(`${this.baseUrl}/type/${name}`);
  }
}