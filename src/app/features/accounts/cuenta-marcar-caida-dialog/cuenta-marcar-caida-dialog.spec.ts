import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CuentaMarcarCaidaDialog } from './cuenta-marcar-caida-dialog';
import { CuentasApi } from '../cuentas-api';

describe('CuentaMarcarCaidaDialog', () => {
  const data = { cuentaId: 'cta-1', correo: 'cuenta@nocturne.dev', servicioNombre: 'Netflix' };

  let fixture: ComponentFixture<CuentaMarcarCaidaDialog>;
  let component: CuentaMarcarCaidaDialog;
  let api: { marcarCaida: ReturnType<typeof vi.fn> };
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  // Fecha fija: "Caída desde" arranca en hoy (local) y no admite futuro.
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 30, 21, 0));

    api = { marcarCaida: vi.fn().mockResolvedValue({ id: 'cta-1', fechaCaida: '2026-01-28' }) };
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CuentaMarcarCaidaDialog],
      providers: [
        { provide: CuentasApi, useValue: api },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaMarcarCaidaDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pide desde qué día está caída, con hoy (fecha local) por defecto', () => {
    // 21:00 del 30/01 en hora local: en UTC ya podría ser 31/01.
    expect(component.form.controls.fechaCaida.value).toBe('2026-01-30');
    expect(fixture.nativeElement.textContent).toContain('Netflix');
    expect(fixture.nativeElement.textContent).toContain('cuenta@nocturne.dev');
    expect(fixture.nativeElement.querySelector('mat-label').textContent).toContain('Caída desde');
  });

  it('no acepta una fecha futura ni vacía', async () => {
    component.form.controls.fechaCaida.setValue('2026-01-31');
    expect(component.form.controls.fechaCaida.hasError('futura')).toBe(true);
    await component.submit();
    expect(api.marcarCaida).not.toHaveBeenCalled();

    component.form.controls.fechaCaida.setValue('');
    expect(component.form.invalid).toBe(true);
  });

  it('marca la cuenta con la fecha elegida y cierra devolviéndola', async () => {
    component.form.controls.fechaCaida.setValue('2026-01-28');

    await component.submit();

    expect(api.marcarCaida).toHaveBeenCalledWith('cta-1', '2026-01-28');
    expect(dialogRef.close).toHaveBeenCalledWith({ id: 'cta-1', fechaCaida: '2026-01-28' });
  });

  it('si el backend rechaza, muestra su mensaje y no cierra', async () => {
    api.marcarCaida.mockRejectedValue(
      new HttpErrorResponse({ status: 400, error: { message: 'La fecha de caída no puede ser futura.' } }),
    );

    await component.submit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('La fecha de caída no puede ser futura.');
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);
  });

  it('cancelar cierra sin marcar nada', () => {
    component.cancel();

    expect(api.marcarCaida).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
