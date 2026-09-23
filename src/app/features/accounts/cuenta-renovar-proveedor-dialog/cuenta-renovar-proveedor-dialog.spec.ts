import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CuentaRenovarProveedorDialog } from './cuenta-renovar-proveedor-dialog';
import { CuentasApi } from '../cuentas-api';
import { PagoProveedorTipo, type PagoProveedor } from '../cuenta.model';
import { Moneda } from '../../sales/venta.model';

describe('CuentaRenovarProveedorDialog', () => {
  const data = {
    cuentaId: 'cta-1',
    correo: 'cuenta@nocturne.dev',
    servicioNombre: 'Netflix',
    fechaFin: '2026-01-31',
  };
  const ultimoPago: PagoProveedor = {
    id: 'pp-2',
    cuentaId: 'cta-1',
    fecha: '2025-12-31',
    monto: 12.5,
    moneda: Moneda.USD,
    tasaCambio: 3.75,
    montoPEN: 46.88,
    metodoPago: 'Binance',
    tipo: PagoProveedorTipo.RENOVACION,
    createdAt: '',
  };

  let fixture: ComponentFixture<CuentaRenovarProveedorDialog>;
  let component: CuentaRenovarProveedorDialog;
  let api: {
    pagosProveedor: ReturnType<typeof vi.fn>;
    renovarProveedor: ReturnType<typeof vi.fn>;
  };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  async function setup(pagos: PagoProveedor[] | Error = [ultimoPago]) {
    api = {
      pagosProveedor:
        pagos instanceof Error ? vi.fn().mockRejectedValue(pagos) : vi.fn().mockResolvedValue(pagos),
      renovarProveedor: vi.fn().mockResolvedValue({ id: 'cta-1', fechaFin: '2026-02-28' }),
    };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CuentaRenovarProveedorDialog],
      providers: [
        { provide: CuentasApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaRenovarProveedorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  // Fecha fija: "Fecha de pago" arranca en hoy (local).
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 30, 21, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('precarga monto, moneda, tipo de cambio y método de pago con el último pago al proveedor de la cuenta', async () => {
    await setup();

    expect(api.pagosProveedor).toHaveBeenCalledWith('cta-1');
    expect(component.form.getRawValue()).toEqual(
      expect.objectContaining({
        monto: 12.5,
        moneda: Moneda.USD,
        tasaCambio: 3.75,
        metodoPago: 'Binance',
      }),
    );
    expect(fixture.nativeElement.textContent).toContain('La última vez pagaste 12.50 USD el 31/12/2025');
  });

  it('fecha de pago = hoy (fecha local) y "Vence ahora el" = vencimiento actual + 1 mes', async () => {
    await setup();

    // 21:00 del 30/01 en hora local: en UTC ya podría ser 31/01.
    expect(component.form.controls.fechaPago.value).toBe('2026-01-30');
    // 31/01 + 1 mes: febrero no tiene 31 → último día de febrero, no 03/03.
    expect(component.form.controls.nuevaFechaFin.value).toBe('2026-02-28');
    expect(fixture.nativeElement.textContent).toContain('Hoy vence con el proveedor el 31/01/2026');
  });

  it('sin pagos anteriores (o si falla la carga), monto y método de pago quedan vacíos para escribirlos', async () => {
    await setup([]);
    expect(component.form.controls.monto.value).toBeNull();
    expect(component.form.controls.metodoPago.value).toBe('');
    expect(component.form.controls.moneda.value).toBe(Moneda.PEN);

    TestBed.resetTestingModule();
    await setup(new Error('500'));
    expect(component.form.controls.monto.value).toBeNull();
    expect(component.form.invalid).toBe(true);
  });

  it('"Vence ahora el" tiene que ser posterior al vencimiento actual', async () => {
    await setup();
    const control = component.form.controls.nuevaFechaFin;

    control.setValue('2026-01-31');
    expect(control.hasError('noPosterior')).toBe(true);
    control.setValue('2026-01-15');
    expect(control.hasError('noPosterior')).toBe(true);
    control.setValue('2026-02-01');
    expect(control.hasError('noPosterior')).toBe(false);
  });

  it('en PEN oculta el tipo de cambio y lo fuerza a 1', async () => {
    await setup();
    expect(fixture.nativeElement.textContent).toContain('Tipo de cambio a soles');

    component.form.controls.moneda.setValue(Moneda.PEN);
    fixture.detectChanges();

    expect(component.form.controls.tasaCambio.value).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('Tipo de cambio a soles');
  });

  it('manda el pago y la nueva fecha, y cierra con la cuenta actualizada', async () => {
    await setup();
    component.form.patchValue({ monto: 14, nuevaFechaFin: '2026-02-28', fechaPago: '2026-01-29' });

    await component.submit();

    expect(api.renovarProveedor).toHaveBeenCalledWith('cta-1', {
      monto: 14,
      moneda: Moneda.USD,
      tasaCambio: 3.75,
      metodoPago: 'Binance',
      fechaPago: '2026-01-29',
      nuevaFechaFin: '2026-02-28',
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'cta-1', fechaFin: '2026-02-28' });
  });

  it('no manda nada si el formulario es inválido', async () => {
    await setup([]);

    await component.submit();

    expect(api.renovarProveedor).not.toHaveBeenCalled();
  });

  it('si el backend rechaza, muestra su mensaje y no cierra', async () => {
    await setup();
    api.renovarProveedor.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'La nueva fecha de vencimiento tiene que ser posterior a la actual.' },
      }),
    );

    await component.submit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe(
      'La nueva fecha de vencimiento tiene que ser posterior a la actual.',
    );
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
