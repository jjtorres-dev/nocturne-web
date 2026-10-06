import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, Theme } from './theme';

describe('Theme', () => {
  let cambiarSistema: ((oscuro: boolean) => void) | undefined;

  // jsdom no implementa matchMedia: se simula el tema del dispositivo.
  function simularSistema(oscuro: boolean): void {
    let listener: (() => void) | undefined;
    const media = {
      matches: oscuro,
      addEventListener: (_: string, fn: () => void) => (listener = fn),
    };
    window.matchMedia = (() => media) as unknown as typeof window.matchMedia;
    cambiarSistema = (valor) => {
      media.matches = valor;
      listener?.();
    };
  }

  function crear(): Theme {
    TestBed.configureTestingModule({});
    return TestBed.inject(Theme);
  }

  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
    simularSistema(false);
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('arranca en claro si no hay nada guardado, aunque el dispositivo esté en oscuro', () => {
    simularSistema(true);
    const theme = crear();
    expect(theme.preference()).toBe('light');
    expect(theme.resolved()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('aplica la preferencia guardada al cargar', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const theme = crear();
    expect(theme.preference()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('ignora un valor guardado que no conoce', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(crear().preference()).toBe('light');
  });

  it('guarda la elección y la aplica al documento', () => {
    const theme = crear();
    theme.set('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(theme.resolved()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('"según el dispositivo" sigue al sistema, también si cambia con la app abierta', () => {
    simularSistema(true);
    const theme = crear();
    theme.set('system');
    expect(theme.resolved()).toBe('dark');

    cambiarSistema?.(false);
    expect(theme.resolved()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('pone en theme-color el rojo del riel de cada tema', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);
    const theme = crear();
    expect(meta.content).toBe('#6e1423');
    theme.set('dark');
    expect(meta.content).toBe('#451019');
    meta.remove();
  });

  it('funciona sin matchMedia', () => {
    delete (window as { matchMedia?: unknown }).matchMedia;
    const theme = crear();
    theme.set('system');
    expect(theme.resolved()).toBe('light');
  });
});
