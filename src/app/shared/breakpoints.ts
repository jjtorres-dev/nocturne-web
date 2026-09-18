import { BreakpointObserver } from '@angular/cdk/layout';
import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// Punto de corte "pantalla angosta" de toda la app. Debe coincidir con el
// `@media (max-width: 767.98px)` de src/styles.scss (los diálogos, tablas y
// filtros se adaptan por CSS; el sidenav del layout y las listas que cambian
// de tabla a tarjetas lo observan por código con `injectIsMobile`).
export const MOBILE_BREAKPOINT_QUERY = '(max-width: 767.98px)';

// Signal que es `true` mientras la pantalla está por debajo del breakpoint y
// se actualiza al redimensionar. Solo se puede llamar en un contexto de
// inyección (inicializador de campo de un componente, constructor…).
export function injectIsMobile(): Signal<boolean> {
  const breakpoints = inject(BreakpointObserver);
  return toSignal(
    breakpoints.observe(MOBILE_BREAKPOINT_QUERY).pipe(map((state) => state.matches)),
    { initialValue: breakpoints.isMatched(MOBILE_BREAKPOINT_QUERY) },
  );
}
