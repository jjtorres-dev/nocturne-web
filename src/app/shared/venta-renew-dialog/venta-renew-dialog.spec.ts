import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VentaRenewDialog } from './venta-renew-dialog';
import { VentasApi } from '../../features/sales/ventas-api';
import { Moneda, type Venta } from '../../features/sales/venta.model';
import { Auth, UserRole } from '../../core/auth/auth';
import { UltimoMetodoPago } from '../metodo-pago/ultimo-metodo-pago';

describe('VentaRenewDialog', () => {
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

  let fixture: ComponentFixture<VentaRenewDialog>;
  let component: VentaRenewDialog;
  let api: { renew: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof vi.fn> };
  let ultimoMetodoPago: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  async function setup(ultimoMetodoPagoGuardado: string | null = 'Plin') {
    api = { renew: vi.fn().mockResolvedValue({ ...venta, fechaFin: '2026-03-01' }) };
    dialogRef = { close: vi.fn() };
    auth = { currentUser: vi.fn().mockReturnValue({ id: 'admin-0', role: UserRole.ADMIN }) };
    ultimoMetodoPago = {
      get: vi.fn().mockReturnValue(ultimoMetodoPagoGuardado),
      set: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VentaRenewDialog],
      providers: [
        { provide: VentasApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { venta } },
        { provide: Auth, useValue: auth },
        { provide: UltimoMetodoPago, useValue: ultimoMetodoPago },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VentaRenewDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('precarga precio/moneda/tasaCambio con los valores actuales de la venta, y metodoPago con el recordado', async () => {
    await setup('Plin');

    expect(component.form.controls.precio.value).toBe(15);
    expect(component.form.controls.moneda.value).toBe(Moneda.PEN);
    expect(component.form.controls.tasaCambio.value).toBe(1);
    expect(component.form.controls.metodoPago.value).toBe('Plin');
  });

  it('sin nada recordado, metodoPago arranca vacío (no usa el metodoPago de la venta)', async () => {
    await setup(null);

    expect(component.form.controls.metodoPago.value).toBe('');
  });

  it('muestra el vencimiento actual y "vencerá N meses después", sin calcular la nueva fecha', async () => {
    await setup();

    const texto: string = fixture.nativeElement.querySelector('.renew-info').textContent;
    expect(texto).toContain('01/02/2026');
    expect(texto.replace(/\s+/g, ' ')).toContain('vencerá 1 mes después');
    // Nada en el DOM del diálogo debería mostrar una fecha nueva calculada
    // (esa solo la sabe el backend, y se muestra en el snackbar del caller).
    expect(fixture.nativeElement.textContent).not.toContain('01/03/2026');
  });

  it('manda exactamente { precio, moneda, tasaCambio, metodoPago } a renew — nunca fechaFin', async () => {
    await setup();
    component.form.patchValue({ precio: 20, metodoPago: 'Zelle' });

    await component.submit();

    expect(api.renew).toHaveBeenCalledWith('v-1', {
      precio: 20,
      moneda: Moneda.PEN,
      tasaCambio: 1,
      metodoPago: 'Zelle',
    });
    const [, body] = api.renew.mock.calls[0] as [string, Record<string, unknown>];
    expect(body).not.toHaveProperty('fechaFin');
    expect(dialogRef.close).toHaveBeenCalledWith(
      expect.objectContaining({ fechaFin: '2026-03-01' }),
    );
  });

  it('tasaCambio: oculto en PEN, aparece con otra moneda y vuelve a 1 al volver a PEN', async () => {
    await setup();
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).toBeNull();

    component.form.controls.moneda.setValue(Moneda.USD);
    component.form.controls.tasaCambio.setValue(3.75);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).not.toBeNull();

    component.form.controls.moneda.setValue(Moneda.PEN);
    fixture.detectChanges();

    expect(component.form.controls.tasaCambio.value).toBe(1);
    expect(
      fixture.nativeElement.querySelector('input[formcontrolname="tasaCambio"]'),
    ).toBeNull();
  });

  it('al renovar con éxito, graba el método de pago usado', async () => {
    await setup();
    component.form.patchValue({ metodoPago: 'Tarjeta' });

    await component.submit();

    expect(ultimoMetodoPago.set).toHaveBeenCalledWith('admin-0', 'Tarjeta');
  });

  it('si falla, muestra el mensaje del backend y no cierra el diálogo', async () => {
    await setup();
    api.renew.mockRejectedValue(
      new HttpErrorResponse({ status: 409, error: { message: 'Ya no está disponible.' } }),
    );

    await component.submit();

    expect(component.errorMessage()).toBe('Ya no está disponible.');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancelar cierra el diálogo sin resultado', async () => {
    await setup();

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
