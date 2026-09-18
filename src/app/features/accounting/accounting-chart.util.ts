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
        backgroundColor: '#10b981', // --nc-accent-green
      },
      {
        label: 'Gastos',
        data: points.map((p) => p.gastos),
        backgroundColor: '#ef4444',
      },
      {
        label: 'Ganancia',
        data: points.map((p) => p.ganancia),
        backgroundColor: '#3b82f6', // --nc-accent-blue
      },
    ],
  };
}
