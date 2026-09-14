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

  it('formatea negativos', () => {
    expect(pipe.transform(-40)).toBe('S/ -40.00');
  });

  it('devuelve vacío para null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
