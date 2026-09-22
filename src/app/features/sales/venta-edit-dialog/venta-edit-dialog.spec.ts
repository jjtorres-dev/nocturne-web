import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { VentaEditDialog } from './venta-edit-dialog';
import { VentasApi } from '../ventas-api';
import { Moneda, type Venta } from '../venta.model';
import { Auth, UserRole } from '../../../core/auth/auth';
import { UltimoMetodoPago } from '../../../shared/metodo-pago/ultimo-metodo-pago';

describe('VentaEditDialog', () => {
  const venta: Venta = {
    id: 'v-1',
    clienteId: 'cli-1',
    cuentaId: 'cta-1',
    perfilId: 'per-1',
    servicioId: 'srv-1',
    codigoVenta: 'V-00001',
    duracionMeses: 1,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-02-01',
    precio: 15,
    moneda: Moneda.PEN,
    tasaCambio: 1,
    precioPEN: 15,
    metodoPago: 'Yape',
    renovacionAutomatica: false,
    activo: true,
    ventaComboId: null,
    owner: { id: 'admin-0', name: 'Admin', email: 'admin@nocturne.dev' },
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<VentaEditDialog>;
  let component: VentaEditDialog;
  let api: { update: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };
  let ultimoMetodoPago: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { update: vi.fn().mockResolvedValue({ ...venta, precio: 20 }) };
    dialogRef = { close: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role: UserRole.ADMIN }) };
    ultimoMetodoPago = { get: vi.fn().mockReturnValue(null), set: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VentaEditDialog],
      providers: [
        { provide: VentasApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { venta } },
        { provide: Auth, useValue: auth },
        { provide: UltimoMetodoPago, useValue: ultimoMetodoPago },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('precarga solo los campos editables desde la venta', () => {
    expect(component.form.controls.fechaFin.value).toBe('2026-02-01');
    expect(component.form.controls.precio.value).toBe(15);
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

  it('no expone campos estructurales (servicio, cuenta, perfil, cliente) en el DOM', () => {
    const html: string = fixture.nativeElement.innerHTML;

    expect(html).not.toContain('formcontrolname="servicioId"');
    expect(html).not.toContain('formcontrolname="cuentaId"');
    expect(html).not.toContain('formcontrolname="perfilId"');
    expect(html).not.toContain('formcontrolname="clienteId"');
  });

  it('no expone campos estructurales en el FormGroup', () => {
    expect(component.form.contains('servicioId')).toBe(false);
    expect(component.form.contains('cuentaId')).toBe(false);
    expect(component.form.contains('perfilId')).toBe(false);
    expect(component.form.contains('clienteId')).toBe(false);
  });

  it('guarda solo los campos editables', async () => {
    component.form.patchValue({ precio: 20 });

    await component.submit();

    expect(api.update).toHaveBeenCalledWith('v-1', {
      fechaFin: '2026-02-01',
      precio: 20,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Yape',
      renovacionAutomatica: false,
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ ...venta, precio: 20 });
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
        error: { message: 'La fecha de fin debe ser posterior a la de inicio.' },
      }),
    );

    component.form.patchValue({ precio: 20 });
    await component.submit();

    expect(component.errorMessage()).toBe('La fecha de fin debe ser posterior a la de inicio.');
  });

  it('cae al mensaje genérico si el backend no mandó ninguno (ej. caída de red)', async () => {
    api.update.mockRejectedValue(new Error('network down'));

    component.form.patchValue({ precio: 20 });
    await component.submit();

    expect(component.errorMessage()).toBe('No se pudo guardar la venta. Intenta de nuevo.');
  });
});
