import type { ChartData } from 'chart.js';
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
        label: 'Ingresos',
        data: points.map((p) => p.ingresos),
        backgroundColor: '#2e7d32',
      },
      {
        label: 'Gastos',
        data: points.map((p) => p.gastos),
        backgroundColor: '#c62828',
      },
      {
        label: 'Ganancia',
        data: points.map((p) => p.ganancia),
        backgroundColor: '#1565c0',
      },
    ],
  };
}
