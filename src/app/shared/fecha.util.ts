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
