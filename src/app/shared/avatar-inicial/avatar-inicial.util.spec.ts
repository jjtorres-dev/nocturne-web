import { AVATAR_PALETTE, colorAvatar, iniciales } from './avatar-inicial.util';

describe('colorAvatar', () => {
  it('devuelve el mismo color para el mismo nombre en llamadas repetidas', () => {
    const first = colorAvatar('María Pérez');
    for (let i = 0; i < 10; i++) {
      expect(colorAvatar('María Pérez')).toBe(first);
    }
  });

  it('ignora mayúsculas y espacios extremos', () => {
    expect(colorAvatar('  juan LOPEZ ')).toBe(colorAvatar('Juan Lopez'));
  });

  it('siempre elige un color de la paleta', () => {
    for (const nombre of ['A', 'Netflix', 'Disney+', 'Cliente 123', 'ñandú', '']) {
      expect(AVATAR_PALETTE).toContain(colorAvatar(nombre));
    }
  });

  it('reparte nombres distintos entre varios colores de la paleta', () => {
    const nombres = ['Ana', 'Luis', 'Carlos', 'Marta', 'Sofía', 'Pedro', 'Lucía', 'Jorge', 'Elena'];
    const colores = new Set(nombres.map(colorAvatar));
    expect(colores.size).toBeGreaterThan(2);
  });
});

describe('iniciales', () => {
  it('toma la inicial de las dos primeras palabras, en mayúscula', () => {
    expect(iniciales('juan pérez gómez')).toBe('JP');
  });

  it('usa una sola inicial con una sola palabra', () => {
    expect(iniciales('Netflix')).toBe('N');
  });

  it('prefiere palabras que empiezan con letra sobre las numéricas', () => {
    expect(iniciales('Netflix 2 Meses')).toBe('NM');
  });

  it('salta símbolos al inicio de la palabra', () => {
    expect(iniciales('(Pro) +Max')).toBe('PM');
  });

  it('devuelve ? si no hay nada usable', () => {
    expect(iniciales('')).toBe('?');
    expect(iniciales('   ')).toBe('?');
    expect(iniciales('—')).toBe('?');
  });
});
