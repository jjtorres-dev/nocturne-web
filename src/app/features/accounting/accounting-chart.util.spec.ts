import {
  buildTimelineChartData,
  periodoCorto,
  periodoLargo,
  rangoPorDefecto,
  solesEje,
} from './accounting-chart.util';
import { TimelineGroupBy, type TimelinePoint } from './accounting.model';

describe('buildTimelineChartData', () => {
  it('arma labels con el periodo en corto y un dataset por cada métrica', () => {
    const points: TimelinePoint[] = [
      { periodo: '2026-01-01', ingresos: 100, inversion: 40, gastos: 30, ganancia: 30 },
      { periodo: '2026-01-02', ingresos: 50, inversion: 0, gastos: 10, ganancia: 40 },
    ];

    const result = buildTimelineChartData(points);

    expect(result.labels).toEqual(['01/01', '02/01']);
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

  it('cada serie toma su color de su token, nunca un valor escrito en el código', () => {
    const root = document.documentElement;
    const tokens: Record<string, string> = {
      '--nc-serie-ingresos': '#010203',
      '--nc-serie-inversion': '#040506',
      '--nc-serie-gastos': '#070809',
      '--nc-serie-ganancia': '#0a0b0c',
    };
    for (const [name, value] of Object.entries(tokens)) {
      root.style.setProperty(name, value);
    }

    try {
      const result = buildTimelineChartData([
        { periodo: '2026-01-01', ingresos: 1, inversion: 1, gastos: 1, ganancia: 1 },
      ]);

      expect(result.datasets.map((d) => d.backgroundColor)).toEqual(Object.values(tokens));
    } finally {
      for (const name of Object.keys(tokens)) {
        root.style.removeProperty(name);
      }
    }
  });
});

describe('periodo del gráfico', () => {
  it('en el eje, el día y la semana van como "dd/MM" y el mes como "MM/aaaa"', () => {
    expect(periodoCorto('2026-10-01', TimelineGroupBy.DAY)).toBe('01/10');
    expect(periodoCorto('2026-10-05', TimelineGroupBy.WEEK)).toBe('05/10');
    expect(periodoCorto('2026-10-01', TimelineGroupBy.MONTH)).toBe('10/2026');
  });

  it('en el globo va la fecha completa, en el formato de la app', () => {
    expect(periodoLargo('2026-10-01', TimelineGroupBy.DAY)).toBe('01/10/2026');
    expect(periodoLargo('2026-10-05', TimelineGroupBy.WEEK)).toBe('Semana del 05/10/2026');
    expect(periodoLargo('2026-10-01', TimelineGroupBy.MONTH)).toBe('10/2026');
  });

  it('acepta el periodo con hora y deja tal cual lo que no es una fecha', () => {
    expect(periodoCorto('2026-10-01T00:00:00.000Z', TimelineGroupBy.DAY)).toBe('01/10');
    expect(periodoCorto('sin fecha', TimelineGroupBy.DAY)).toBe('sin fecha');
    expect(periodoLargo('sin fecha', TimelineGroupBy.MONTH)).toBe('sin fecha');
  });
});

describe('solesEje', () => {
  it('pone el signo delante de la moneda, con el menos tipográfico', () => {
    expect(solesEje(300)).toBe('S/ 300');
    expect(solesEje(0)).toBe('S/ 0');
    expect(solesEje(-10)).toBe('−S/ 10');
  });
});

describe('rangoPorDefecto', () => {
  it('es el mes calendario actual en UTC, del día 1 al último, igual que el backend', () => {
    expect(rangoPorDefecto(new Date('2026-10-06T15:00:00Z'))).toEqual({
      desde: '2026-10-01',
      hasta: '2026-10-31',
    });
    expect(rangoPorDefecto(new Date('2028-02-29T23:59:59Z'))).toEqual({
      desde: '2028-02-01',
      hasta: '2028-02-29',
    });
    expect(rangoPorDefecto(new Date('2026-12-31T23:00:00Z'))).toEqual({
      desde: '2026-12-01',
      hasta: '2026-12-31',
    });
  });
});
