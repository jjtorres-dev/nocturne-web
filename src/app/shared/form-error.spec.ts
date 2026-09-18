import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { injectFormError } from './form-error';

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
