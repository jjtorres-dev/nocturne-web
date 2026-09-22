import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GastoFormDialog } from './gasto-form-dialog';
import { GastosApi } from '../gastos-api';
import { Moneda } from '../../sales/venta.model';
import type { Gasto } from '../expense.model';

describe('GastoFormDialog', () => {
  let fixture: ComponentFixture<GastoFormDialog>;
  let component: GastoFormDialog;
  let api: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  async function setup(data: { gasto?: Gasto } = {}) {
    api = {
      create: vi.fn().mockResolvedValue({ id: 'gasto-1' }),
      update: vi.fn().mockResolvedValue({ id: 'gasto-1' }),
    };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [GastoFormDialog],
      providers: [
        { provide: GastosApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
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

    expect(component.errorMessage()).toBe('No se pudo guardar el gasto. Intenta de nuevo.');
  });
});
