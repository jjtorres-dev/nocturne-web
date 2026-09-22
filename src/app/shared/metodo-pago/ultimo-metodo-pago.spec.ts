import { TestBed } from '@angular/core/testing';
import { UltimoMetodoPago } from './ultimo-metodo-pago';

describe('UltimoMetodoPago', () => {
  let store: UltimoMetodoPago;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(UltimoMetodoPago);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('devuelve null si nunca se guardó nada para ese usuario', () => {
    expect(store.get('user-1')).toBeNull();
  });

  it('guarda y recupera el último método de pago de un usuario', () => {
    store.set('user-1', 'Yape');

    expect(store.get('user-1')).toBe('Yape');
  });

  it('no mezcla el valor guardado entre usuarios distintos', () => {
    store.set('user-1', 'Yape');
    store.set('user-2', 'Plin');

    expect(store.get('user-1')).toBe('Yape');
    expect(store.get('user-2')).toBe('Plin');
  });

  it('un guardado nuevo reemplaza el anterior del mismo usuario', () => {
    store.set('user-1', 'Yape');
    store.set('user-1', 'Transferencia bancaria');

    expect(store.get('user-1')).toBe('Transferencia bancaria');
  });

  it('no revienta si localStorage no está disponible', () => {
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('no disponible');
    });
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('no disponible');
    });

    expect(() => store.set('user-1', 'Yape')).not.toThrow();
    expect(store.get('user-1')).toBeNull();

    getSpy.mockRestore();
    setSpy.mockRestore();
  });
});
