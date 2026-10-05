import {
  clientesTexto,
  diasEntre,
  diasTexto,
  formatFechaCorta,
  hoyIso,
  sumarMeses,
} from './fecha.util';

describe('sumarMeses', () => {
  // Misma tabla que `addMonthsToDate` en nocturne-api (src/sales/
  // date.util.spec.ts): si se cambia una, cambiar la otra, para que front y
  // back no diverjan.
  it.each([
    ['2026-01-15', 1, '2026-02-15'],
    ['2026-01-31', 1, '2026-02-28'],
    ['2028-01-31', 1, '2028-02-29'],
    ['2026-03-31', 1, '2026-04-30'],
    ['2028-02-29', 12, '2029-02-28'],
    ['2026-01-31', 2.5, '2026-04-15'],
    ['2026-12-31', 1, '2027-01-31'],
  ])('%s + %s meses = %s', (fecha, meses, esperado) => {
    expect(sumarMeses(fecha, meses)).toBe(esperado);
  });

  it('con 0 meses devuelve la misma fecha', () => {
    expect(sumarMeses('2026-03-10', 0)).toBe('2026-03-10');
  });
});

describe('hoyIso', () => {
  it('devuelve la fecha local de hoy en formato YYYY-MM-DD', () => {
    vi.useFakeTimers();
    // 23:30 en UTC-5 (Perú) es ya el día siguiente en UTC: si se usara
    // toISOString() esto daría 2026-09-23, no 2026-09-22.
    vi.setSystemTime(new Date(2026, 8, 22, 23, 30));

    expect(hoyIso()).toBe('2026-09-22');

    vi.useRealTimers();
  });
});

describe('formatFechaCorta', () => {
  it('convierte YYYY-MM-DD a DD/MM/YYYY', () => {
    expect(formatFechaCorta('2026-01-05')).toBe('05/01/2026');
  });
});

describe('diasEntre', () => {
  // Misma tabla que `daysBetween` en nocturne-api (sales/date.util.spec.ts).
  it.each([
    ['2026-10-01', '2026-10-01', 0],
    ['2026-10-01', '2026-10-05', 4],
    ['2026-02-27', '2026-03-02', 3],
    ['2028-02-27', '2028-03-02', 4],
    ['2026-12-30', '2027-01-02', 3],
    ['2026-10-05', '2026-10-01', -4],
  ])('de %s a %s = %i días', (desde, hasta, esperado) => {
    expect(diasEntre(desde, hasta)).toBe(esperado);
  });
});

describe('diasTexto y clientesTexto', () => {
  it('usan singular solo con 1', () => {
    expect([0, 1, 2].map(diasTexto)).toEqual(['0 días', '1 día', '2 días']);
    expect([0, 1, 2].map(clientesTexto)).toEqual(['0 clientes', '1 cliente', '2 clientes']);
  });
});
