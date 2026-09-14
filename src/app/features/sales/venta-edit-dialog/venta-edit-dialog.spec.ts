import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentaEditDialog } from './venta-edit-dialog';
import { VentasApi } from '../ventas-api';
import { Moneda, type Venta } from '../venta.model';

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
    createdAt: '',
    updatedAt: '',
  };

  let fixture: ComponentFixture<VentaEditDialog>;
  let component: VentaEditDialog;
  let api: { update: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { update: vi.fn().mockResolvedValue({ ...venta, precio: 20 }) };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [VentaEditDialog],
      providers: [
        { provide: VentasApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { venta } },
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
});
