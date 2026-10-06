import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { VentaComboEditDialog } from './venta-combo-edit-dialog';
import { VentaCombosApi } from '../venta-combos-api';
import { type VentaCombo } from '../venta-combo.model';
import { Moneda } from '../../sales/venta.model';
import { Auth, UserRole } from '../../../core/auth/auth';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';

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
  let auth: { currentUser: ReturnType<typeof vi.fn> };
  let ultimoMetodoPago: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { update: vi.fn().mockResolvedValue({ ...ventaCombo, precio: 25 }) };
    dialogRef = { close: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role: UserRole.ADMIN }) };
    ultimoMetodoPago = { get: vi.fn().mockReturnValue(null), set: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VentaComboEditDialog],
      providers: [
        { provide: VentaCombosApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ventaCombo } },
        { provide: Auth, useValue: auth },
        { provide: UltimoMetodoPago, useValue: ultimoMetodoPago },
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

  it('tasaCambio: oculta el campo en PEN (ya lo está al precargar), aparece con otra moneda y vuelve a 1 al volver a PEN', () => {
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

  it('el método de pago usa el selector reusable y precarga la opción fija correcta', async () => {
    expect(fixture.nativeElement.querySelector('app-metodo-pago-select')).not.toBeNull();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(
      MatSelectHarness.with({ ancestor: 'app-metodo-pago-select' }),
    );

    expect(await select.getValueText()).toBe('Yape');
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

  it('al guardar con éxito, graba el método de pago usado (editar también cuenta)', async () => {
    component.form.patchValue({ metodoPago: 'Plin' });

    await component.submit();

    expect(ultimoMetodoPago.set).toHaveBeenCalledWith('admin-0', 'Plin');
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
      'No se pudo guardar la venta de combo. Inténtalo de nuevo.',
    );
  });

  it('con datos faltantes no guarda: marca los campos para que cada uno diga qué le falta', async () => {
    const guardar: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(guardar.disabled).toBe(false);
    component.form.controls.precio.setValue(null as unknown as number);

    await component.submit();
    fixture.detectChanges();

    expect(api.update).not.toHaveBeenCalled();
    expect(component.form.controls.precio.touched).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Escribe cuánto te pagó el cliente.');
  });
});
