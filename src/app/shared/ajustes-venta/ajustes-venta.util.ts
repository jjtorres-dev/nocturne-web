import type { AjusteVenta } from '../../features/sales/venta.model';

// "+5 días por cuenta caída del 30/09" (el día en que se cayó). El año no
// va: el historial es reciente y la línea tiene que entrar en un celular.
export function ajusteLabel(ajuste: Pick<AjusteVenta, 'dias' | 'fechaCaida'>): string {
  const [, mes, dia] = ajuste.fechaCaida.slice(0, 10).split('-');
  const dias = ajuste.dias === 1 ? '1 día' : `${ajuste.dias} días`;
  return `+${dias} por cuenta caída del ${dia}/${mes}`;
}
