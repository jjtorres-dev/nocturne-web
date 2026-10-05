import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CuentaReponerDialog,
  type CuentaReponerDialogData,
} from './cuenta-reponer-dialog';
import { CuentasApi } from '../cuentas-api';
import type { Cuenta, CuentaRepuesta } from '../cuenta.model';
import type { Perfil } from '../profiles/perfil.model';

describe('CuentaReponerDialog', () => {
  const cuenta: Cuenta = {
    id: 'cta-1',
    servicioId: 'srv-1',
    proveedorId: null,
    clienteId: null,
    correo: 'vieja@nocturne.dev',
    claveServicio: 'clave-vieja',
    claveCorreo: 'correo-viejo',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-03-01',
    costo: 40,
    metodoPago: 'Yape',
    url: null,
    renovacionAutomatica: false,
    activo: true,
    fechaCaida: '2026-01-25',
    owner: { id: 'u-1', name: 'Ana', email: 'ana@nocturne.dev' },
    createdAt: '',
    updatedAt: '',
  };
  const perfil = (id: string, nombre: string, pin: string | null): Perfil => ({
    id,
    cuentaId: 'cta-1',
    nombre,
    pin,
    clienteId: null,
    activo: true,
    createdAt: '',
    updatedAt: '',
  });
  const perfiles = [perfil('p1', 'Perfil 1', '1111'), perfil('p2', 'Perfil 2', null)];
  const repuesta: CuentaRepuesta = {
    ...cuenta,
    correo: 'nueva@nocturne.dev',
    claveServicio: 'clave-nueva',
    fechaCaida: null,
    compensacion: {
      dias: 5,
      fechaCaida: '2026-01-25',
      fechaReposicion: '2026-01-30',
      ventas: 2,
      combos: 1,
      clientes: 3,
    },
  };

  let fixture: ComponentFixture<CuentaReponerDialog>;
  let component: CuentaReponerDialog;
  let api: { reponer: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn>; disableClose: boolean };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  async function setup(extra: Partial<CuentaReponerDialogData> = {}) {
    TestBed.resetTestingModule();
    api = { reponer: vi.fn().mockResolvedValue(repuesta) };
    dialogRef = { close: vi.fn(), disableClose: false };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CuentaReponerDialog],
      providers: [
        { provide: CuentasApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatSnackBar, useValue: snackBar },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            cuenta,
            servicioNombre: 'Netflix',
            perfiles,
            clientesAfectados: 3,
            ...extra,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaReponerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function texto(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function resumen(): string {
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.resumen').textContent.trim();
  }

  // Caída el 25/01; "hoy" es el 30/01 a las 21:00 (hora local).
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 30, 21, 0));
    await setup();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('arranca con el correo vacío, los perfiles con su nombre y PIN, la reposición hoy y los días precalculados', () => {
    const raw = component.form.getRawValue();
    expect(raw.correo).toBe('');
    expect(raw.claveServicio).toBe('');
    expect(raw.claveCorreo).toBe('');
    expect(raw.perfiles).toEqual([
      { id: 'p1', nombre: 'Perfil 1', pin: '1111' },
      { id: 'p2', nombre: 'Perfil 2', pin: '' },
    ]);
    expect(raw.fechaReposicion).toBe('2026-01-30');
    // 30/01 - 25/01.
    expect(raw.diasCompensacion).toBe(5);
    expect(texto()).toContain('Caída desde el 25/01/2026');
    expect(texto()).toContain('lleva 5 días');
  });

  it('dice exactamente qué va a pasar: "Se sumarán N días a X clientes"', () => {
    expect(resumen()).toBe('Se sumarán 5 días a 3 clientes.');

    component.form.controls.diasCompensacion.setValue(1);
    expect(resumen()).toBe('Se sumará 1 día a 3 clientes.');

    component.form.controls.diasCompensacion.setValue(0);
    expect(resumen()).toBe('No se sumarán días a ningún cliente.');

    component.form.controls.diasCompensacion.setValue(null);
    expect(resumen()).toBe('Escribe cuántos días les vas a compensar a tus clientes.');
  });

  it('el resumen con 1 cliente, sin clientes y sin saber cuántos son', async () => {
    await setup({ clientesAfectados: 1 });
    expect(resumen()).toBe('Se sumarán 5 días a 1 cliente.');

    await setup({ clientesAfectados: 0 });
    expect(resumen()).toBe(
      'Esta cuenta no tiene clientes con ventas vigentes: no se sumarán días a nadie.',
    );

    await setup({ clientesAfectados: null });
    expect(resumen()).toBe(
      'Se sumarán 5 días a cada cliente con una venta vigente en esta cuenta.',
    );
  });

  it('"Días a compensar" sigue a la fecha de reposición hasta que se escribe a mano', () => {
    const { fechaReposicion, diasCompensacion } = component.form.controls;

    fechaReposicion.setValue('2026-01-28');
    expect(diasCompensacion.value).toBe(3);

    diasCompensacion.setValue(10);
    diasCompensacion.markAsDirty();
    fechaReposicion.setValue('2026-01-27');
    expect(diasCompensacion.value).toBe(10);
  });

  it('valida el correo, la fecha (ni antes de la caída ni futura) y los días (entero, 0 o más)', () => {
    const c = component.form.controls;
    expect(component.form.invalid).toBe(true);
    c.correo.setValue('no-es-correo');
    expect(c.correo.hasError('email')).toBe(true);
    c.correo.setValue('nueva@nocturne.dev');
    expect(component.form.valid).toBe(true);

    c.fechaReposicion.setValue('2026-01-24');
    expect(c.fechaReposicion.hasError('antesDeCaida')).toBe(true);
    c.fechaReposicion.setValue('2026-01-31');
    expect(c.fechaReposicion.hasError('futura')).toBe(true);
    c.fechaReposicion.setValue('2026-01-25');
    expect(c.fechaReposicion.valid).toBe(true);

    c.diasCompensacion.setValue(-1);
    expect(c.diasCompensacion.invalid).toBe(true);
    c.diasCompensacion.setValue(1.5);
    expect(c.diasCompensacion.invalid).toBe(true);
    c.diasCompensacion.setValue(0);
    expect(c.diasCompensacion.valid).toBe(true);
  });

  it('con el formulario inválido no llama al backend', async () => {
    await component.submit();

    expect(api.reponer).not.toHaveBeenCalled();
  });

  it('manda solo lo que cambió: claves vacías y perfiles sin tocar no viajan', async () => {
    component.form.controls.correo.setValue('nueva@nocturne.dev');

    await component.submit();

    expect(api.reponer).toHaveBeenCalledWith('cta-1', {
      correo: 'nueva@nocturne.dev',
      fechaReposicion: '2026-01-30',
      diasCompensacion: 5,
    });
  });

  it('manda las claves nuevas y, de cada perfil, solo el nombre o el PIN que cambió (PIN borrado = null)', async () => {
    const c = component.form.controls;
    c.correo.setValue('nueva@nocturne.dev');
    c.claveServicio.setValue('clave-nueva');
    c.claveCorreo.setValue('correo-nuevo');
    c.perfiles.at(0).patchValue({ nombre: 'Sala', pin: '' });
    c.perfiles.at(1).patchValue({ pin: '2222' });
    c.fechaReposicion.setValue('2026-01-29');
    c.diasCompensacion.setValue(7);

    await component.submit();

    expect(api.reponer).toHaveBeenCalledWith('cta-1', {
      correo: 'nueva@nocturne.dev',
      claveServicio: 'clave-nueva',
      claveCorreo: 'correo-nuevo',
      perfiles: [
        { id: 'p1', nombre: 'Sala', pin: null },
        { id: 'p2', pin: '2222' },
      ],
      fechaReposicion: '2026-01-29',
      diasCompensacion: 7,
    });
  });

  it('al terminar no se cierra: dice qué pasó y ofrece "Copiar datos" para avisar a los clientes', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    component.form.controls.correo.setValue('nueva@nocturne.dev');

    await component.submit();
    fixture.detectChanges();

    expect(dialogRef.close).not.toHaveBeenCalled();
    // Solo se cierra con "Listo": Escape o un click afuera perderían el resultado.
    expect(dialogRef.disableClose).toBe(true);
    expect(texto()).toContain('Cuenta repuesta');
    expect(texto()).toContain('Se sumaron 5 días a 3 clientes.');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();

    const botones = Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));
    botones.find((b) => b.textContent?.includes('Copiar datos'))!.click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith(
      [
        'Tu cuenta de Netflix cambió. Estos son los datos nuevos:',
        'Correo: nueva@nocturne.dev',
        'Contraseña: clave-nueva',
        'Te sumé 5 días por el tiempo que estuviste sin servicio.',
      ].join('\n'),
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      'Datos copiados. Ya puedes pegarlos en WhatsApp.',
      'Cerrar',
      expect.anything(),
    );

    botones.find((b) => b.textContent?.includes('Listo'))!.click();
    expect(dialogRef.close).toHaveBeenCalledWith(repuesta);
  });

  it('si no se compensó a nadie, lo dice así', async () => {
    api.reponer.mockResolvedValue({
      ...repuesta,
      compensacion: { ...repuesta.compensacion, dias: 0, ventas: 0, combos: 0, clientes: 0 },
    });
    component.form.controls.correo.setValue('nueva@nocturne.dev');

    await component.submit();
    fixture.detectChanges();

    expect(texto()).toContain('No se sumaron días a ningún cliente.');
  });

  it('si el backend rechaza, muestra su mensaje y el formulario sigue ahí', async () => {
    api.reponer.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'La cuenta no está marcada como caída: no hay nada que reponer.' },
      }),
    );
    component.form.controls.correo.setValue('nueva@nocturne.dev');

    await component.submit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe(
      'La cuenta no está marcada como caída: no hay nada que reponer.',
    );
    expect(component.repuesta()).toBeNull();
    expect(dialogRef.disableClose).toBe(false);
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(component.saving()).toBe(false);
  });

  it('cancelar cierra sin reponer', () => {
    component.cancel();

    expect(api.reponer).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
