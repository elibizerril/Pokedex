import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'pokedex-theme';

  readonly theme = signal<Theme>('light');

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = saved === 'dark' || (saved === null && prefersDark) ? 'dark' : 'light';
    this.apply(initial);
    this.theme.set(initial);
  }

  toggle(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
    this.apply(this.theme());
    localStorage.setItem(this.storageKey, this.theme());
  }

  private apply(theme: Theme): void {
    document.documentElement.dataset['theme'] = theme;
  }
}