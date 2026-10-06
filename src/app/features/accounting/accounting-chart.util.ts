import type { ChartData } from 'chart.js';
import { cssToken } from '../../shared/css-token';
import { TimelineGroupBy, type TimelinePoint } from './accounting.model';

// Separado del componente para poder testear la transformación de datos sin
// tocar Chart.js ni el <canvas> (que en jsdom no tiene contexto 2D real).
export function buildTimelineChartData(
  points: TimelinePoint[],
  groupBy: TimelineGroupBy = TimelineGroupBy.DAY,
): ChartData<'bar'> {
  return {
    labels: points.map((p) => periodoCorto(p.periodo, groupBy)),
    datasets: [
      {
        label: 'Cobrado',
        data: points.map((p) => p.ingresos),
        backgroundColor: cssToken('--nc-serie-ingresos'),
      },
      {
        label: 'Pagado a proveedores',
        data: points.map((p) => p.inversion),
        backgroundColor: cssToken('--nc-serie-inversion'),
      },
      {
        label: 'Gastos',
        data: points.map((p) => p.gastos),
        backgroundColor: cssToken('--nc-serie-gastos'),
      },
      {
        label: 'Ganancia',
        data: points.map((p) => p.ganancia),
        backgroundColor: cssToken('--nc-serie-ganancia'),
      },
    ],
  };
}

// El backend manda cada periodo como la fecha en que empieza ("2026-10-01").
// Si llegara otra cosa, se muestra tal cual.
const PERIODO_ISO = /^(\d{4})-(\d{2})-(\d{2})/;

// Para el eje: el día en corto ("01/10"); un mes, como mes y año ("10/2026"),
// para que no se lea como un día.
export function periodoCorto(periodo: string, groupBy: TimelineGroupBy): string {
  const partes = PERIODO_ISO.exec(periodo);
  if (!partes) {
    return periodo;
  }
  const [, anio, mes, dia] = partes;
  return groupBy === TimelineGroupBy.MONTH ? `${mes}/${anio}` : `${dia}/${mes}`;
}

// Para el globo: la fecha completa, en el formato de la app.
export function periodoLargo(periodo: string, groupBy: TimelineGroupBy): string {
  const partes = PERIODO_ISO.exec(periodo);
  if (!partes) {
    return periodo;
  }
  const [, anio, mes, dia] = partes;
  switch (groupBy) {
    case TimelineGroupBy.MONTH:
      return `${mes}/${anio}`;
    case TimelineGroupBy.WEEK:
      return `Semana del ${dia}/${mes}/${anio}`;
    default:
      return `${dia}/${mes}/${anio}`;
  }
}

// Monto en soles para el eje del gráfico, sin decimales. El signo va delante
// de la moneda ("−S/ 10"), con el signo menos tipográfico.
export function solesEje(value: number): string {
  const monto = `S/ ${Math.abs(value).toFixed(0)}`;
  return value < 0 ? `−${monto}` : monto;
}

// El rango que el backend usa cuando no se le manda "desde" ni "hasta": el
// mes calendario actual, del día 1 al último, calculado en UTC (ver
// resolveRango en nocturne-api). Solo sirve para MOSTRARLO en los campos;
// el cálculo lo sigue haciendo el backend con su propio reloj.
export function rangoPorDefecto(hoy: Date = new Date()): { desde: string; hasta: string } {
  const iso = (fecha: Date) => fecha.toISOString().slice(0, 10);
  return {
    desde: iso(new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1))),
    hasta: iso(new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 0))),
  };
}
