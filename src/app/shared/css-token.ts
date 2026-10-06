// Valor actual de un token CSS de Nocturne (ver src/styles.scss), ya resuelto.
// Para lo que no puede usar `var(--nc-*)` directo, como Chart.js, que pinta
// en un <canvas>. Así el color sigue saliendo de un solo lugar.
export function cssToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
