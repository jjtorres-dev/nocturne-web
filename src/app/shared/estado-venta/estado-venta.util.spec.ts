import { ESTADO_VENTA_LABELS, estadoVenta } from './estado-venta.util';

describe('estadoVenta', () => {
  const hoy = '2026-01-15';

  it('vigente: activa y vence hoy o después', () => {
    expect(estadoVenta({ activo: true, fechaFin: '2026-01-15' }, hoy)).toBe('vigente');
    expect(estadoVenta({ activo: true, fechaFin: '2026-02-01' }, hoy)).toBe('vigente');
  });

  it('vencida: activa y la fecha de vencimiento ya pasó', () => {
    expect(estadoVenta({ activo: true, fechaFin: '2026-01-14' }, hoy)).toBe('vencida');
    expect(estadoVenta({ activo: true, fechaFin: '2025-12-31' }, hoy)).toBe('vencida');
  });

  it('finalizada: no está activa, aunque todavía no haya vencido', () => {
    expect(estadoVenta({ activo: false, fechaFin: '2026-01-14' }, hoy)).toBe('finalizada');
    expect(estadoVenta({ activo: false, fechaFin: '2026-02-01' }, hoy)).toBe('finalizada');
  });

  it('sin `hoy` explícito usa la fecha LOCAL (hoyIso), no la de UTC', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // 23:30 del 15/01 en hora local: en husos negativos (Perú, UTC-5) en UTC
    // ya sería 16/01 y una venta que vence el 15 saldría vencida por error.
    vi.setSystemTime(new Date(2026, 0, 15, 23, 30));
    try {
      expect(estadoVenta({ activo: true, fechaFin: '2026-01-15' })).toBe('vigente');
      expect(estadoVenta({ activo: true, fechaFin: '2026-01-14' })).toBe('vencida');
    } finally {
      vi.useRealTimers();
    }
  });

  it('etiquetas visibles', () => {
    expect(ESTADO_VENTA_LABELS).toEqual({
      vigente: 'Vigente',
      vencida: 'Vencida',
      finalizada: 'Finalizada',
    });
  });
});
