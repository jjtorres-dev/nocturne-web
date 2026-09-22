import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { extractErrorMessage, injectFormError } from './form-error';

@Component({
  selector: 'app-form-error-host',
  template: `
    <div class="top">arriba</div>
    @if (formError.message(); as m) {
      <p class="error-message" role="alert">{{ m }}</p>
    }
  `,
})
class Host {
  readonly formError = injectFormError();
}

describe('injectFormError', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let openSpy: ReturnType<typeof vi.spyOn>;
  let scrollSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    openSpy = vi
      .spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open')
      .mockImplementation(() => ({}) as never);
    // jsdom no implementa scrollIntoView.
    scrollSpy = vi.fn();
    Element.prototype.scrollIntoView = scrollSpy as never;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });

  it('empieza sin mensaje', () => {
    expect(host.formError.message()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('show() expone el mensaje y lo pinta en el elemento role="alert"', async () => {
    host.formError.show('Algo falló');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.formError.message()).toBe('Algo falló');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Algo falló',
    );
  });

  it('show() dispara un snackbar con el mismo mensaje', () => {
    host.formError.show('Algo falló');

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(
      'Algo falló',
      'Cerrar',
      expect.objectContaining({ duration: 5000 }),
    );
  });

  it('show() hace scroll hasta el mensaje una vez renderizado', async () => {
    host.formError.show('Algo falló');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ block: 'nearest' }));
  });

  it('clear() quita el mensaje sin abrir otro snackbar', async () => {
    host.formError.show('Algo falló');
    await fixture.whenStable();
    openSpy.mockClear();

    host.formError.clear();
    fixture.detectChanges();

    expect(host.formError.message()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(openSpy).not.toHaveBeenCalled();
  });
});

describe('extractErrorMessage', () => {
  it('devuelve el mensaje del backend cuando es un string', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { message: 'Ya existe un usuario con ese email.' },
    });
    expect(extractErrorMessage(error, 'genérico')).toBe('Ya existe un usuario con ese email.');
  });

  it('une los mensajes cuando el backend manda un array (class-validator)', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: ['El email es requerido.', 'La contraseña es muy corta.'] },
    });
    expect(extractErrorMessage(error, 'genérico')).toBe(
      'El email es requerido. La contraseña es muy corta.',
    );
  });

  it('cae al mensaje genérico si el backend no mandó message', () => {
    const error = new HttpErrorResponse({ status: 500, error: {} });
    expect(extractErrorMessage(error, 'genérico')).toBe('genérico');
  });

  it('cae al mensaje genérico si el backend mandó un array vacío', () => {
    const error = new HttpErrorResponse({ status: 400, error: { message: [] } });
    expect(extractErrorMessage(error, 'genérico')).toBe('genérico');
  });

  it('cae al mensaje genérico si no es un HttpErrorResponse (ej. caída de red)', () => {
    expect(extractErrorMessage(new TypeError('Failed to fetch'), 'genérico')).toBe('genérico');
    expect(extractErrorMessage(null, 'genérico')).toBe('genérico');
  });
});
