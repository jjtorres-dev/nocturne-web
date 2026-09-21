// Paleta chica que armoniza con el degradado de marca (azul -> cian ->
// verde-turquesa, ver `--nc-gradient-primary` en styles.scss). Son tonos
// 600/700 para que el texto blanco de las iniciales conserve buen contraste.
export const AVATAR_PALETTE = [
  '#2563eb', // azul
  '#0e7490', // cian
  '#0f766e', // turquesa
  '#047857', // esmeralda
  '#4f46e5', // índigo
  '#0369a1', // celeste
] as const;

const ALNUM = /[\p{L}\p{N}]/u;

// Primer carácter alfanumérico de cada palabra ("Disney+" -> "D", "(Pro)" -> "P").
// Se prefieren palabras que empiezan con letra sobre las que empiezan con
// dígito: "Netflix 2 Meses" -> "NM" y no "N2".
export function iniciales(nombre: string): string {
  const initials = nombre
    .trim()
    .split(/\s+/)
    .map((word) => Array.from(word).find((ch) => ALNUM.test(ch)))
    .filter((ch): ch is string => ch !== undefined);

  const letters = initials.filter((ch) => /\p{L}/u.test(ch));
  const chosen = letters.length > 0 ? letters : initials;
  return chosen.slice(0, 2).join('').toUpperCase() || '?';
}

// Hash djb2 sobre el nombre normalizado (sin espacios extremos, minúsculas):
// el mismo nombre siempre cae en el mismo índice de la paleta.
export function colorAvatar(nombre: string): string {
  const normalized = nombre.trim().toLowerCase();
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
