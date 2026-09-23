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

// Como sumarMeses, pero si el día no existe en el mes de destino se queda
// en el último día de ese mes (31/01 + 1 mes = 28/02, no 03/03). Lo usa
// "Vence ahora el" al renovar con el proveedor: ahí un desborde deja la
// cuenta venciendo días después de la fecha real sin que se note.
export function sumarMesesSinDesbordar(fechaIso: string, meses: number): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const ultimoDiaDestino = new Date(anio, mes - 1 + meses + 1, 0).getDate();
  const fecha = new Date(anio, mes - 1 + meses, Math.min(dia, ultimoDiaDestino));

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
