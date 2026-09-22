import { formatFechaCorta, hoyIso, sumarMeses } from './fecha.util';

describe('sumarMeses', () => {
  it('suma meses simples', () => {
    expect(sumarMeses('2026-01-15', 1)).toBe('2026-02-15');
  });

  it('cruza de año', () => {
    expect(sumarMeses('2026-12-01', 2)).toBe('2027-02-01');
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
