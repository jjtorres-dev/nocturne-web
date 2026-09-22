import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Configuracion } from './configuracion';

describe('Configuracion', () => {
  let fixture: ComponentFixture<Configuracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Configuracion],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(Configuracion);
    fixture.detectChanges();
  });

  it('muestra el título y la sección "Cambiar contraseña"', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Configuración');
    const secciones = el.querySelector('.secciones');
    expect(secciones?.querySelector('app-cambiar-password')).not.toBeNull();
    expect(secciones?.textContent).toContain('Cambiar contraseña');
  });
});
