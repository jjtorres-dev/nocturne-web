import { SERVICE_ICONS, type ServiceIconDef } from './service-icons.data';

// Minúsculas y sin acentos, para que "Crunchyroll" y "  CRUNCHYROLL " (o
// "Vídeo") comparen igual sin importar cómo se tipeó el nombre.
function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Keywords de 4+ letras matchean por substring ("Netflix 2 Meses" -> netflix).
// Las de 1-3 letras ("hbo", "max") exigen palabra completa: si no, "Maximo"
// o "Ambox" se llevarían el ícono de otra marca.
function matches(name: string, keyword: string): boolean {
  if (keyword.length >= 4) {
    return name.includes(keyword);
  }
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(keyword)}($|[^\\p{L}\\p{N}])`, 'u').test(
    name,
  );
}

// Keywords más largas primero: "hbo max" y "youtube music" tienen que ganarle
// a "hbo" y "youtube". El sort es estable, así que el resto respeta el orden
// del set curado.
const ENTRIES = SERVICE_ICONS.flatMap((icon) =>
  icon.keywords.map((keyword) => ({ keyword, icon })),
).sort((a, b) => b.keyword.length - a.keyword.length);

// Devuelve el ícono de marca que corresponde a Servicio.nombre, o null si no
// hay match (el llamador cae al avatar de iniciales).
export function resolveServiceIcon(nombre: string | null | undefined): ServiceIconDef | null {
  if (!nombre) {
    return null;
  }
  const name = normalize(nombre);
  return ENTRIES.find(({ keyword }) => matches(name, keyword))?.icon ?? null;
}
