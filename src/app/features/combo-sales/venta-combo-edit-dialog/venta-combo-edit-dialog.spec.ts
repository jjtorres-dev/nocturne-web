import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentaComboEditDialog } from './venta-combo-edit-dialog';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';

describe('VentaComboEditDialog', () => {
  const ventaCombo: VentaCombo = {
    id: 'vc-1',
    clienteId: 'cli-1',
    comboId: 'combo-1',
    codigoVenta: 'C-00001',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-01',
    duracionMeses: 1,
    precio: 20,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    precioPEN: 20,
    metodoPago: 'Yape',
    renovacionAutomatica: false,
    activo: true,
    owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<VentaComboEditDialog>;
  let component: VentaComboEditDialog;
  let api: { update: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { update: vi.fn().mockResolvedValue({ ...ventaCombo, precio: 25 }) };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VentaComboEditDialog],
      providers: [
        { provide: VentaCombosApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ventaCombo } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaComboEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('precarga solo los campos editables desde la venta de combo', () => {
    expect(component.form.controls.fechaFin.value).toBe('2026-02-01');
    expect(component.form.controls.precio.value).toBe(20);
    expect(component.form.controls.moneda.value).toBe(Moneda.PEN);
    expect(component.form.controls.tasaCambio.value).toBe(1);
    expect(component.form.controls.metodoPago.value).toBe('Yape');
    expect(component.form.controls.renovacionAutomatica.value).toBe(false);
  });

  it('no expone campos estructurales (cliente, combo, asignaciones) en el FormGroup', () => {
    expect(component.form.contains('clienteId')).toBe(false);
    expect(component.form.contains('comboId')).toBe(false);
    expect(component.form.contains('asignaciones')).toBe(false);
  });

  it('guarda solo los campos editables', async () => {
    component.form.patchValue({ precio: 25 });

    await component.submit();

    expect(api.update).toHaveBeenCalledWith('vc-1', {
      fechaFin: '2026-02-01',
      precio: 25,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Yape',
      renovacionAutomatica: false,
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ ...ventaCombo, precio: 25 });
  });

  it('muestra el mensaje real del backend, no el genérico', async () => {
    api.update.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'La tasa de cambio debe ser mayor que cero.' },
      }),
    );

    component.form.patchValue({ precio: 25 });
    await component.submit();

    expect(component.errorMessage()).toBe('La tasa de cambio debe ser mayor que cero.');
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    api.update.mockRejectedValue(new Error('network down'));

    component.form.patchValue({ precio: 25 });
    await component.submit();

    expect(component.errorMessage()).toBe(
      'No se pudo guardar la venta de combo. Intenta de nuevo.',
    );
  });
});
