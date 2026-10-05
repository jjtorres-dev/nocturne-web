import {
  formatearDatosParaCliente,
  formatearDatosParaClienteCombo,
  formatearDatosReposicion,
} from './copiar-datos.util';

describe('formatearDatosParaCliente', () => {
  it('arma el mensaje completo cuando hay contraseña y perfil con PIN', () => {
    const mensaje = formatearDatosParaCliente({
      servicioNombre: 'Netflix',
      correo: 'cuenta@correo.com',
      claveServicio: 'super-secreta',
      perfilNombre: 'Perfil 1',
      perfilPin: '1234',
      fechaFin: '2026-03-15',
    });

    expect(mensaje).toBe(
      [
        'Servicio: Netflix',
        'Correo: cuenta@correo.com',
        'Contraseña: super-secreta',
        'Perfil: Perfil 1',
        'PIN: 1234',
        'Vence: 15/03/2026',
      ].join('\n'),
    );
  });

  it('omite la línea de Contraseña si la cuenta no tiene (proveedor que solo da código)', () => {
    const mensaje = formatearDatosParaCliente({
      servicioNombre: 'IPTV',
      correo: 'cuenta@correo.com',
      claveServicio: null,
      perfilNombre: null,
      perfilPin: null,
      fechaFin: '2026-03-15',
    });

    expect(mensaje).not.toContain('Contraseña');
  });

  it('omite Perfil y PIN cuando el servicio es sin perfiles (perfilNombre null)', () => {
    const mensaje = formatearDatosParaCliente({
      servicioNombre: 'IPTV',
      correo: 'cuenta@correo.com',
      claveServicio: 'clave',
      perfilNombre: null,
      perfilPin: null,
      fechaFin: '2026-03-15',
    });

    expect(mensaje).not.toContain('Perfil');
    expect(mensaje).not.toContain('PIN');
  });

  it('muestra Perfil pero omite PIN si el perfil no tiene uno cargado', () => {
    const mensaje = formatearDatosParaCliente({
      servicioNombre: 'Netflix',
      correo: 'cuenta@correo.com',
      claveServicio: 'clave',
      perfilNombre: 'Perfil 2',
      perfilPin: null,
      fechaFin: '2026-03-15',
    });

    expect(mensaje).toContain('Perfil: Perfil 2');
    expect(mensaje).not.toContain('PIN');
  });

  it('nunca arma una URL: no contiene "http" ni "wa.me"', () => {
    const mensaje = formatearDatosParaCliente({
      servicioNombre: 'Netflix',
      correo: 'cuenta@correo.com',
      claveServicio: 'super-secreta',
      perfilNombre: 'Perfil 1',
      perfilPin: '1234',
      fechaFin: '2026-03-15',
    });

    expect(mensaje).not.toContain('http');
    expect(mensaje).not.toContain('wa.me');
  });
});

describe('formatearDatosParaClienteCombo', () => {
  it('junta los mensajes de cada cuenta separados por una línea en blanco', () => {
    const mensaje = formatearDatosParaClienteCombo([
      {
        servicioNombre: 'Netflix',
        correo: 'netflix@correo.com',
        claveServicio: 'clave-netflix',
        perfilNombre: 'Perfil 1',
        perfilPin: null,
        fechaFin: '2026-03-15',
      },
      {
        servicioNombre: 'IPTV',
        correo: 'iptv@correo.com',
        claveServicio: null,
        perfilNombre: null,
        perfilPin: null,
        fechaFin: '2026-03-15',
      },
    ]);

    expect(mensaje).toBe(
      [
        'Servicio: Netflix',
        'Correo: netflix@correo.com',
        'Contraseña: clave-netflix',
        'Perfil: Perfil 1',
        'Vence: 15/03/2026',
        '',
        'Servicio: IPTV',
        'Correo: iptv@correo.com',
        'Vence: 15/03/2026',
      ].join('\n'),
    );
  });
});

describe('formatearDatosReposicion', () => {
  it('arma el aviso con el correo y la contraseña nuevos y los días sumados', () => {
    expect(
      formatearDatosReposicion({
        servicioNombre: 'Netflix',
        correo: 'nueva@correo.com',
        claveServicio: 'clave-nueva',
        diasCompensados: 5,
      }),
    ).toBe(
      [
        'Tu cuenta de Netflix cambió. Estos son los datos nuevos:',
        'Correo: nueva@correo.com',
        'Contraseña: clave-nueva',
        'Te sumé 5 días por el tiempo que estuviste sin servicio.',
      ].join('\n'),
    );
  });

  it('omite la contraseña si no hay y los días si no se compensó nada; 1 día en singular', () => {
    expect(
      formatearDatosReposicion({
        servicioNombre: 'IPTV',
        correo: 'iptv@correo.com',
        claveServicio: null,
        diasCompensados: 0,
      }),
    ).toBe(
      ['Tu cuenta de IPTV cambió. Estos son los datos nuevos:', 'Correo: iptv@correo.com'].join(
        '\n',
      ),
    );
    expect(
      formatearDatosReposicion({
        servicioNombre: 'IPTV',
        correo: 'iptv@correo.com',
        claveServicio: null,
        diasCompensados: 1,
      }),
    ).toContain('Te sumé 1 día por');
  });
});
