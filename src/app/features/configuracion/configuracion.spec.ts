import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Configuracion } from './configuracion';

describe('Configuracion', () => {
  let fixture: ComponentFixture<Configuracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Configuracion] }).compileComponents();
    fixture = TestBed.createComponent(Configuracion);
    fixture.detectChanges();
  });

  it('muestra el título y el contenedor de secciones (vacío por ahora)', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Configuración');
    expect(el.querySelector('.secciones')).not.toBeNull();
    expect(el.querySelector('.secciones')?.children.length).toBe(0);
  });
});
