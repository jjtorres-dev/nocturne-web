import { buildTimelineChartData } from './accounting-chart.util';
import type { TimelinePoint } from './accounting.model';

describe('buildTimelineChartData', () => {
  it('arma labels desde periodo y un dataset por cada métrica', () => {
    const points: TimelinePoint[] = [
      { periodo: '2026-01-01', ingresos: 100, inversion: 40, gastos: 30, ganancia: 30 },
      { periodo: '2026-01-02', ingresos: 50, inversion: 0, gastos: 10, ganancia: 40 },
    ];

    const result = buildTimelineChartData(points);

    expect(result.labels).toEqual(['2026-01-01', '2026-01-02']);
    expect(result.datasets).toHaveLength(4);
    expect(result.datasets[0]).toMatchObject({
      label: 'Cobrado',
      data: [100, 50],
    });
    expect(result.datasets[1]).toMatchObject({
      label: 'Pagado a proveedores',
      data: [40, 0],
    });
    expect(result.datasets[2]).toMatchObject({
      label: 'Gastos',
      data: [30, 10],
    });
    expect(result.datasets[3]).toMatchObject({
      label: 'Ganancia',
      data: [30, 40],
    });
  });

  it('devuelve labels y datasets vacíos si no hay puntos', () => {
    const result = buildTimelineChartData([]);

    expect(result.labels).toEqual([]);
    expect(result.datasets.every((d) => d.data.length === 0)).toBe(true);
  });
});
