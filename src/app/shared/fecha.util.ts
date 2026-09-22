// Suma meses a una fecha 'YYYY-MM-DD' (el formato de <input type="date">)
// sin pasar por UTC: `new Date('YYYY-MM-DD')` la interpreta como
// medianoche UTC y `getDate()`/`getMonth()` locales pueden correrla un día
// según la zona horaria del navegador. Se arma la fecha a mano con los
// componentes ya parseados para evitar ese corrimiento.
export function sumarMeses(fechaIso: string, meses: number): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setMonth(fecha.getMonth() + meses);

  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Fecha de hoy en 'YYYY-MM-DD', hora local (no UTC): `toISOString()` puede
// devolver el día siguiente en las horas de la tarde/noche en husos
// negativos (Perú, UTC-5) — sirve p. ej. para nombres de archivo de export.
export function hoyIso(): string {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Convierte 'YYYY-MM-DD' a 'DD/MM/YYYY' para mostrar (mismo formato que
// DatePipe con 'dd/MM/yyyy'), sin pasar por Date/locale: son siempre fechas
// puras (sin hora), un split alcanza y evita el mismo corrimiento de UTC.
export function formatFechaCorta(fechaIso: string): string {
  const [yyyy, mm, dd] = fechaIso.split('-');
  return `${dd}/${mm}/${yyyy}`;
}
