import { ajusteLabel } from './ajustes-venta.util';

describe('ajusteLabel', () => {
  it('"+N días por cuenta caída del DD/MM", con la fecha en que se cayó', () => {
    expect(ajusteLabel({ dias: 5, fechaCaida: '2026-09-30' })).toBe(
      '+5 días por cuenta caída del 30/09',
    );
  });

  it('1 día en singular', () => {
    expect(ajusteLabel({ dias: 1, fechaCaida: '2026-01-05' })).toBe(
      '+1 día por cuenta caída del 05/01',
    );
  });
});
