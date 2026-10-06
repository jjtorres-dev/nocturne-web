import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { GastoFormDialog } from './gasto-form-dialog';
import { GastosApi } from '../gastos-api';
import { Moneda } from '../../sales/venta.model';
import type { Gasto } from '../expense.model';
import { Auth, UserRole } from '../../../core/auth/auth';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';

describe('GastoFormDialog', () => {
  let fixture: ComponentFixture<GastoFormDialog>;
  let component: GastoFormDialog;
  let api: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };
  let ultimoMetodoPago: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  async function setup(
    data: { gasto?: Gasto } = {},
    ultimoMetodoPagoGuardado: string | null = null,
  ) {
    api = {
      create: vi.fn().mockResolvedValue({ id: 'gasto-1' }),
      update: vi.fn().mockResolvedValue({ id: 'gasto-1' }),
    };
    dialogRef = { close: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role: UserRole.ADMIN }) };
    ultimoMetodoPago = {
      get: vi.fn().mockReturnValue(ultimoMetodoPagoGuardado),
      set: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GastoFormDialog],
      providers: [
        { provide: GastosApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: Auth, useValue: auth },
        { provide: UltimoMetodoPago, useValue: ultimoMetodoPago },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GastoFormDialog);
    component = fixture.componentInstance;
  }

  it('arranca en modo creación con valores por defecto', async () => {
    await setup();
    await fixture.whenStable();

    expect(component.isEdit).toBe(false);
    expect(component.form.controls.moneda.value).toBe(Moneda.PEN);
    expect(component.form.controls.tasaCambio.value).toBe(1);
  });

  it('tasaCambio: oculta el campo en PEN, aparece con otra moneda, y vuelve a 1 al volver a PEN', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).toBeNull();

    component.form.controls.moneda.setValue(Moneda.USD);
    component.form.controls.tasaCambio.setValue(3.75);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).not.toBeNull();
    expect(component.form.controls.tasaCambio.value).toBe(3.75);

    component.form.controls.moneda.setValue(Moneda.PEN);
    fixture.detectChanges();

    expect(component.form.controls.tasaCambio.value).toBe(1);
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).toBeNull();
  });

  it('al crear, arranca con el último método de pago guardado para este usuario', async () => {
    await setup({}, 'Plin');
    await fixture.whenStable();

    expect(ultimoMetodoPago.get).toHaveBeenCalledWith('admin-0');
    expect(component.form.controls.metodoPago.value).toBe('Plin');
  });

  it('al editar, ignora lo guardado y arranca con el metodoPago real del gasto', async () => {
    const gasto: Gasto = {
      id: 'gasto-1',
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      montoPEN: 50,
      metodoPago: 'Tarjeta',
      fecha: '2026-01-05',
      activo: true,
      owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
      createdAt: '',
      updatedAt: '',
    };
    await setup({ gasto }, 'Plin');
    await fixture.whenStable();

    expect(ultimoMetodoPago.get).not.toHaveBeenCalled();
    expect(component.form.controls.metodoPago.value).toBe('Tarjeta');
  });

  it('al guardar con éxito (crear o editar), graba el método de pago usado', async () => {
    await setup();
    await fixture.whenStable();
    component.form.patchValue({
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Plin',
      fecha: '2026-01-05',
    });

    await component.submit();

    expect(ultimoMetodoPago.set).toHaveBeenCalledWith('admin-0', 'Plin');
  });

  it('crea un gasto con el payload del formulario', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
    });

    await component.submit();

    expect(api.create).toHaveBeenCalledWith({
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'gasto-1' });
  });

  it('precarga los datos del gasto en modo edición', async () => {
    const gasto: Gasto = {
      id: 'gasto-1',
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      montoPEN: 50,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
      activo: true,
      owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
      createdAt: '',
      updatedAt: '',
    };
    await setup({ gasto });
    await fixture.whenStable();

    expect(component.isEdit).toBe(true);
    expect(component.form.controls.descripcion.value).toBe('Hosting');
    expect(component.form.controls.monto.value).toBe(50);
  });

  it('el método de pago usa el selector reusable y precarga la opción fija correcta', async () => {
    const gasto: Gasto = {
      id: 'gasto-1',
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      montoPEN: 50,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
      activo: true,
      owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
      createdAt: '',
      updatedAt: '',
    };
    await setup({ gasto });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-metodo-pago-select')).not.toBeNull();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(
      MatSelectHarness.with({ ancestor: 'app-metodo-pago-select' }),
    );

    expect(await select.getValueText()).toBe('Yape');
  });

  it('actualiza un gasto existente', async () => {
    const gasto: Gasto = {
      id: 'gasto-1',
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      montoPEN: 50,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
      activo: true,
      owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
      createdAt: '',
      updatedAt: '',
    };
    await setup({ gasto });
    await fixture.whenStable();

    component.form.patchValue({ monto: 75 });
    await component.submit();

    expect(api.update).toHaveBeenCalledWith(
      'gasto-1',
      expect.objectContaining({ monto: 75 }),
    );
  });

  it('no envía el formulario si es inválido', async () => {
    await setup();
    await fixture.whenStable();

    component.form.patchValue({ descripcion: '' });
    await component.submit();

    expect(api.create).not.toHaveBeenCalled();
  });

  it('muestra el mensaje real del backend (ej. una validación), no el genérico', async () => {
    await setup();
    await fixture.whenStable();
    api.create.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: ['monto must be a positive number'] },
      }),
    );

    component.form.patchValue({
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
    });
    await component.submit();

    expect(component.errorMessage()).toBe('monto must be a positive number');
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    await setup();
    await fixture.whenStable();
    api.create.mockRejectedValue(new Error('network down'));

    component.form.patchValue({
      descripcion: 'Hosting',
      monto: 50,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Yape',
      fecha: '2026-01-05',
    });
    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar el gasto. Inténtalo de nuevo.');
  });

  it('con datos faltantes no guarda: marca los campos para que cada uno diga qué le falta', async () => {
    await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    const guardar: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(guardar.disabled).toBe(false);

    await component.submit();
    fixture.detectChanges();

    expect(api.create).not.toHaveBeenCalled();
    expect(component.form.controls.descripcion.touched).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('La descripción es obligatoria.');
  });
});
