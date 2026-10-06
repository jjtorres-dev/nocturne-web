import { DOCUMENT } from '@angular/common';
import { Service, inject, signal } from '@angular/core';

// Lo que elige el usuario en el menú: un tema fijo o el del dispositivo.
export type ThemePreference = 'light' | 'dark' | 'system';
// Lo que se pinta: `system` ya resuelto.
export type ResolvedTheme = 'light' | 'dark';

// La misma clave y los mismos valores que lee el script de src/index.html,
// que aplica el tema antes del primer pintado (sin parpadeo de la pantalla
// clara). Si algo cambia acá, cambia allá.
export const THEME_STORAGE_KEY = 'nocturne_theme';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system'];

// `theme-color` (la barra del navegador en el celular): el valor de
// `--nc-nav` de cada tema. Va literal porque el navegador lo lee fuera del
// CSS (ver "Archivos de marca" en DESIGN.md).
const THEME_COLOR: Record<ResolvedTheme, string> = { light: '#6e1423', dark: '#451019' };

// Tema de la app. La preferencia se guarda en el navegador de cada
// dispositivo (no en la cuenta) y arranca en claro.
@Service()
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly preferenceState = signal<ThemePreference>(readPreference());
  private readonly resolvedState = signal<ResolvedTheme>(this.resolve());

  readonly preference = this.preferenceState.asReadonly();
  // Cambia DESPUÉS de aplicar el tema al documento: quien lo observe (el
  // gráfico de Contabilidad) ya lee los tokens nuevos.
  readonly resolved = this.resolvedState.asReadonly();

  constructor() {
    this.apply();
    // "Según el dispositivo" sigue al sistema también con la app abierta.
    this.media?.addEventListener('change', () => this.apply());
  }

  set(preference: ThemePreference): void {
    this.preferenceState.set(preference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Sin almacenamiento (modo privado estricto): vale para esta visita.
    }
    this.apply();
  }

  private resolve(): ResolvedTheme {
    const preference = this.preferenceState();
    if (preference === 'system') {
      return this.media?.matches ? 'dark' : 'light';
    }
    return preference;
  }

  private apply(): void {
    const theme = this.resolve();
    this.document.documentElement.dataset['theme'] = theme;
    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[theme]);
    this.resolvedState.set(theme);
  }
}

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_PREFERENCES.find((p) => p === stored) ?? 'light';
  } catch {
    return 'light';
  }
}
