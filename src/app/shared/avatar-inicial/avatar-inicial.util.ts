// Tonos oscuros de la paleta de Nocturne (tokens `--nc-avatar-*` en
// styles.scss) para que las iniciales en `--nc-on-avatar` conserven buen
// contraste.
export const AVATAR_PALETTE = [
  'var(--nc-avatar-1)',
  'var(--nc-avatar-2)',
  'var(--nc-avatar-3)',
  'var(--nc-avatar-4)',
  'var(--nc-avatar-5)',
  'var(--nc-avatar-6)',
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
