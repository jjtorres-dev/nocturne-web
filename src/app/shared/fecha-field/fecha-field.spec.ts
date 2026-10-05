import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { HarnessLoader } from '@angular/cdk/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { of } from 'rxjs';
import { FechaDateAdapter, dateAIso, isoADate } from './fecha-date-adapter';
import { FechaField } from './fecha-field';

@Component({
  imports: [ReactiveFormsModule, FechaField],
  template: `<app-fecha-field
    [formControl]="control"
    label="Vence"
    requiredError="Elige cuándo vence."
    [min]="min"
    [errores]="{ futura: 'No puede ser una fecha futura.' }"
  />`,
})
class Host {
  readonly control = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  min: string | null = null;
}

@Component({
  imports: [FormsModule, FechaField],
  template: `<app-fecha-field [(ngModel)]="desde" label="Desde" />`,
})
class HostNgModel {
  desde = '2026-01-31';
}

describe('FechaField', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let loader: HarnessLoader;

  async function setup(mobile = false): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Host, HostNgModel],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: mobile, breakpoints: {} }),
            isMatched: () => mobile,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  }

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function escribir(texto: string): void {
    input().value = texto;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  describe('escribir a mano', () => {
    beforeEach(() => setup());

    it("05/03/2026 da '2026-03-05' (5 de marzo, no 3 de mayo)", () => {
      escribir('05/03/2026');

      expect(host.control.value).toBe('2026-03-05');
    });

    it('acepta día y mes de un dígito y otros separadores', () => {
      escribir('5/3/2026');
      expect(host.control.value).toBe('2026-03-05');

      escribir('31-12-2026');
      expect(host.control.value).toBe('2026-12-31');

      escribir('01.02.2027');
      expect(host.control.value).toBe('2027-02-01');
    });

    it("a medio escribir o con una fecha que no existe el valor es '' y avisa el formato", async () => {
      host.control.setValue('2026-03-05');
      fixture.detectChanges();

      for (const texto of ['05/03/20', '05/03', '31/02/2026', '05/13/2026', '2026-03-05', 'hola']) {
        escribir(texto);
        expect(host.control.value, texto).toBe('');
      }

      input().dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      const campo = await loader.getHarness(MatFormFieldHarness);
      expect(await campo.getTextErrors()).toEqual([
        'Escribe la fecha como día/mes/año, por ejemplo 05/03/2026.',
      ]);

      escribir('05/03/2026');
      expect(host.control.value).toBe('2026-03-05');
      expect(await campo.getTextErrors()).toEqual([]);
    });

    it('borrar el texto deja el valor vacío y muestra el error de obligatorio al salir', async () => {
      host.control.setValue('2026-03-05');
      fixture.detectChanges();

      escribir('');
      input().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(host.control.value).toBe('');
      expect(host.control.touched).toBe(true);
      const campo = await loader.getHarness(MatFormFieldHarness);
      expect(await campo.getTextErrors()).toEqual(['Elige cuándo vence.']);
    });
  });

  describe('valor del formulario', () => {
    beforeEach(() => setup());

    it('un valor puesto desde código se muestra como dd/mm/aaaa y no marca dirty', () => {
      host.control.setValue('2026-03-05');
      fixture.detectChanges();

      expect(input().value).toBe('05/03/2026');
      expect(host.control.dirty).toBe(false);
      expect(host.control.value).toBe('2026-03-05');
    });

    it('escribir marca el control como dirty', () => {
      host.control.setValue('2026-03-05');
      fixture.detectChanges();
      expect(host.control.dirty).toBe(false);

      escribir('06/03/2026');

      expect(host.control.dirty).toBe(true);
      expect(host.control.value).toBe('2026-03-06');
    });

    it('el valor nunca se corre un día: lo que entra es lo que se muestra y lo que sale', () => {
      const fechas = [
        '2026-01-01',
        '2026-03-05',
        '2026-03-08', // cambio de hora en EE. UU.
        '2026-03-29', // cambio de hora en Europa
        '2026-10-25',
        '2026-11-01',
        '2026-12-31',
        '2028-02-29',
        '1999-12-31',
      ];
      for (const fecha of fechas) {
        const [yyyy, mm, dd] = fecha.split('-');
        const texto = `${dd}/${mm}/${yyyy}`;

        host.control.setValue(fecha);
        fixture.detectChanges();
        expect(input().value, fecha).toBe(texto);

        escribir('');
        escribir(texto);
        expect(host.control.value, fecha).toBe(fecha);
      }
    });

    it('un valor vacío o que no es una fecha deja el campo vacío', () => {
      host.control.setValue('2026-03-05');
      fixture.detectChanges();

      host.control.setValue('');
      fixture.detectChanges();
      expect(input().value).toBe('');

      host.control.setValue('2026-02-31');
      fixture.detectChanges();
      expect(input().value).toBe('');
    });

    it('deshabilitar el control deshabilita el campo', () => {
      host.control.disable();
      fixture.detectChanges();
      expect(input().disabled).toBe(true);

      host.control.enable();
      fixture.detectChanges();
      expect(input().disabled).toBe(false);
    });

    it('muestra el asterisco de obligatorio y los mensajes de los demás validadores', async () => {
      const campo = await loader.getHarness(MatFormFieldHarness);
      expect(
        fixture.nativeElement.querySelector('.mat-mdc-form-field-required-marker'),
      ).not.toBeNull();

      host.control.setValue('2026-03-05');
      host.control.setErrors({ futura: true });
      host.control.markAsTouched();
      fixture.detectChanges();

      expect(await campo.getTextErrors()).toEqual(['No puede ser una fecha futura.']);
    });

    it('markAllAsTouched sobre un campo vacío muestra el error de obligatorio', async () => {
      host.control.markAllAsTouched();
      fixture.detectChanges();

      const campo = await loader.getHarness(MatFormFieldHarness);
      expect(await campo.getTextErrors()).toEqual(['Elige cuándo vence.']);
    });

    it('funciona con ngModel', async () => {
      const ngModelFixture = TestBed.createComponent(HostNgModel);
      ngModelFixture.detectChanges();
      await ngModelFixture.whenStable();
      ngModelFixture.detectChanges();
      const el: HTMLInputElement = ngModelFixture.nativeElement.querySelector('input');
      expect(el.value).toBe('31/01/2026');

      el.value = '01/02/2026';
      el.dispatchEvent(new Event('input'));

      expect(ngModelFixture.componentInstance.desde).toBe('2026-02-01');
    });
  });

  describe('calendario', () => {
    it('sale en español, con la semana desde el lunes', async () => {
      await setup();
      host.control.setValue('2026-03-05');
      fixture.detectChanges();

      const picker = await loader.getHarness(MatDatepickerInputHarness);
      await picker.openCalendar();
      const calendario = await picker.getCalendar();

      expect(await calendario.getCurrentViewLabel()).toMatch(/^marzo de 2026$/i);
      const dias = Array.from(
        document.querySelectorAll('.mat-calendar-table-header th .cdk-visually-hidden'),
      ).map((th) => th.textContent?.trim());
      expect(dias).toEqual([
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
        'domingo',
      ]);
      expect(
        document.querySelector('.mat-calendar-previous-button')?.getAttribute('aria-label'),
      ).toBe('Mes anterior');
      // 2 de marzo de 2026 es lunes: abre la primera semana completa.
      const semana = document.querySelectorAll('.mat-calendar-body tr')[1];
      expect(semana.textContent?.trim().split(/\s+/)).toEqual(['2', '3', '4', '5', '6', '7', '8']);
    });

    it('elegir un día guarda esa fecha exacta y marca dirty', async () => {
      await setup();
      host.control.setValue('2026-03-05');
      fixture.detectChanges();

      const picker = await loader.getHarness(MatDatepickerInputHarness);
      await picker.openCalendar();
      const calendario = await picker.getCalendar();
      await calendario.selectCell({ text: '31' });

      expect(host.control.value).toBe('2026-03-31');
      expect(host.control.dirty).toBe(true);
      expect(input().value).toBe('31/03/2026');
    });

    it('respeta el mínimo: los días anteriores no se pueden elegir', async () => {
      await setup();
      host.min = '2026-03-10';
      host.control.setValue('2026-03-15');
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const picker = await loader.getHarness(MatDatepickerInputHarness);
      await picker.openCalendar();
      const calendario = await picker.getCalendar();
      const [nueve] = await calendario.getCells({ text: '9' });
      const [diez] = await calendario.getCells({ text: '10' });

      expect(await nueve.isDisabled()).toBe(true);
      expect(await diez.isDisabled()).toBe(false);
    });

    it('en escritorio se abre como desplegable; en celular, como diálogo táctil', async () => {
      await setup(false);
      let picker = await loader.getHarness(MatDatepickerInputHarness);
      await picker.openCalendar();
      expect(document.querySelector('.mat-datepicker-content-touch')).toBeNull();
      expect(document.querySelector('.mat-datepicker-content')).not.toBeNull();
      await picker.closeCalendar();

      TestBed.resetTestingModule();
      await setup(true);
      picker = await loader.getHarness(MatDatepickerInputHarness);
      await picker.openCalendar();
      expect(document.querySelector('.mat-datepicker-content-touch')).not.toBeNull();
    });
  });
});

describe('fecha-date-adapter', () => {
  it('isoADate arma la fecha a medianoche local (no UTC)', () => {
    const fecha = isoADate('2026-03-05')!;

    expect([fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), fecha.getHours()]).toEqual([
      2026, 2, 5, 0,
    ]);
    expect(isoADate('2026-03-05T23:30:00.000Z')!.getDate()).toBe(5);
    expect(isoADate('')).toBeNull();
    expect(isoADate(null)).toBeNull();
    expect(isoADate('2026-02-31')).toBeNull();
  });

  it('dateAIso usa los componentes locales a cualquier hora del día', () => {
    // A las 23:59 hora local, toISOString() ya es el día siguiente en
    // cualquier huso negativo (Perú, UTC-5); a las 00:00, el anterior en los
    // positivos.
    expect(dateAIso(new Date(2026, 2, 5, 23, 59, 59))).toBe('2026-03-05');
    expect(dateAIso(new Date(2026, 2, 5, 0, 0, 0))).toBe('2026-03-05');
    expect(dateAIso(new Date(2026, 11, 31, 23, 59, 59))).toBe('2026-12-31');
    expect(dateAIso(null)).toBe('');
    expect(dateAIso(new Date(NaN))).toBe('');
  });

  it('el adaptador lee y arma día/mes/año, con lunes como primer día', () => {
    TestBed.configureTestingModule({ providers: [FechaDateAdapter] });
    const adapter = TestBed.inject(FechaDateAdapter);

    expect(adapter.getFirstDayOfWeek()).toBe(1);
    expect(dateAIso(adapter.parse('05/03/2026'))).toBe('2026-03-05');
    expect(adapter.parse('')).toBeNull();
    expect(adapter.isValid(adapter.parse('31/02/2026')!)).toBe(false);
    expect(adapter.isValid(adapter.parse('05/03/26')!)).toBe(false);
    expect(adapter.format(new Date(2026, 2, 5), 'dd/MM/yyyy')).toBe('05/03/2026');
  });
});
