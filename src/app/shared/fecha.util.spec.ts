import { sumarMeses } from './fecha.util';

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
