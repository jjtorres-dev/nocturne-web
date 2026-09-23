import { hoyIso } from '../fecha.util';

// Estado de una venta (o venta de combo) TAL COMO SE MUESTRA. En el backend
// solo existe `activo`; "vencida" se deriva acá comparando fechaFin con la
// fecha local de hoy, con el mismo criterio que Vencimientos (vence hoy =
// todavía vigente). Es solo presentación: el filtro de Estado de las
// listas sigue siendo por `activo` (Sin finalizar/Finalizadas).
export type EstadoVenta = 'vigente' | 'vencida' | 'finalizada';

export const ESTADO_VENTA_LABELS: Record<EstadoVenta, string> = {
  vigente: 'Vigente',
  vencida: 'Vencida',
  finalizada: 'Finalizada',
};

export function estadoVenta(
  venta: { activo: boolean; fechaFin: string },
  hoy: string = hoyIso(),
): EstadoVenta {
  if (!venta.activo) {
    return 'finalizada';
  }
  // Ambas son 'YYYY-MM-DD': la comparación de strings es cronológica.
  return venta.fechaFin.slice(0, 10) < hoy ? 'vencida' : 'vigente';
}
