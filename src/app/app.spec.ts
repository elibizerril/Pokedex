import { TestBed } from '@angular/core/testing';
import { App } from './app';

function stubMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('App', () => {
  beforeEach(async () => {
    stubMatchMedia();
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders header com toggle de tema', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('.theme-toggle') as HTMLElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Modo');
  });
});