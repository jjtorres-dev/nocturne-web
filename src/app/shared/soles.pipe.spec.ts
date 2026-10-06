import { TestBed } from '@angular/core/testing';
import { SolesPipe } from './soles.pipe';

describe('SolesPipe', () => {
  let pipe: SolesPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new SolesPipe());
  });

  it('antepone el símbolo S/ con 2 decimales', () => {
    expect(pipe.transform(500)).toBe('S/ 500.00');
  });

  it('agrupa miles', () => {
    expect(pipe.transform(1234.5)).toBe('S/ 1,234.50');
  });

  it('pone el signo de los negativos delante de la moneda', () => {
    expect(pipe.transform(-40)).toBe('−S/ 40.00');
    expect(pipe.transform(-1253.5)).toBe('−S/ 1,253.50');
  });

  it('no le pone signo a un monto que redondea a cero', () => {
    expect(pipe.transform(-0.001)).toBe('S/ 0.00');
    expect(pipe.transform(-0)).toBe('S/ 0.00');
  });

  it('devuelve vacío para null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
