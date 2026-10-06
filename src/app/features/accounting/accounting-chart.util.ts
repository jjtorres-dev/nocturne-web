import type { ChartData } from 'chart.js';
import { cssToken } from '../../shared/css-token';
import type { TimelinePoint } from './accounting.model';

// Separado del componente para poder testear la transformación de datos sin
// tocar Chart.js ni el <canvas> (que en jsdom no tiene contexto 2D real).
export function buildTimelineChartData(
  points: TimelinePoint[],
): ChartData<'bar'> {
  return {
    labels: points.map((p) => p.periodo),
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
