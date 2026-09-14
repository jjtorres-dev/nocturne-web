import {
  limpiarNumeroWhatsapp,
  mensajeRenovacion,
  whatsappRenewalUrl,
} from './whatsapp.util';
import { VencimientoFiltro } from './venta.model';

describe('limpiarNumeroWhatsapp', () => {
  it('quita el signo + y deja solo dígitos', () => {
    expect(limpiarNumeroWhatsapp('+51999999999')).toBe('51999999999');
  });

  it('quita espacios y guiones', () => {
    expect(limpiarNumeroWhatsapp('+51 999-999-999')).toBe('51999999999');
  });

  it('antepone 51 cuando el número tiene 9 dígitos (formato local sin código de país)', () => {
    expect(limpiarNumeroWhatsapp('999999999')).toBe('51999999999');
  });

  it('no modifica un número que ya incluye el código de país (51 + 9 dígitos)', () => {
    expect(limpiarNumeroWhatsapp('51999999999')).toBe('51999999999');
  });
});

describe('mensajeRenovacion', () => {
  const params = {
    cliente: 'Juan',
    servicio: 'Netflix',
    fechaFin: '2026-09-17',
    dias: 3,
  };

  it('arma el mensaje de venta vencida', () => {
    expect(mensajeRenovacion(VencimientoFiltro.VENCIDA, params)).toBe(
      'Hola Juan, tu servicio de Netflix venció el 17/09/2026. ¿Deseas renovarlo?',
    );
  });

  it('arma el mensaje de venta por vencer, incluyendo los días', () => {
    expect(mensajeRenovacion(VencimientoFiltro.POR_VENCER, params)).toBe(
      'Hola Juan, tu servicio de Netflix vence el 17/09/2026 (en 3 días). ¿Deseas renovarlo?',
    );
  });
});

describe('whatsappRenewalUrl', () => {
  it('arma la URL de wa.me con el número limpio y el mensaje codificado', () => {
    const url = whatsappRenewalUrl('+51 999-999-999', VencimientoFiltro.VENCIDA, {
      cliente: 'Juan',
      servicio: 'Netflix',
      fechaFin: '2026-09-17',
      dias: 0,
    });

    expect(url).toBe(
      'https://wa.me/51999999999?text=' +
        encodeURIComponent(
          'Hola Juan, tu servicio de Netflix venció el 17/09/2026. ¿Deseas renovarlo?',
        ),
    );
  });
});
