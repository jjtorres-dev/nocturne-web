import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ControlValueAccessor } from '@angular/forms';
import { FormControl, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  type ErrorStateMatcher,
} from '@angular/material/core';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { injectIsMobile } from '../breakpoints';
import { formatFechaCorta } from '../fecha.util';
import {
  FECHA_DATE_FORMATS,
  FECHA_LOCALE,
  FechaDateAdapter,
  dateAIso,
  isoADate,
} from './fecha-date-adapter';

// Textos de los botones del calendario (lectores de pantalla y tooltips).
function datepickerIntlEs(): MatDatepickerIntl {
  const intl = new MatDatepickerIntl();
  intl.calendarLabel = 'Calendario';
  intl.openCalendarLabel = 'Abrir calendario';
  intl.closeCalendarLabel = 'Cerrar calendario';
  intl.prevMonthLabel = 'Mes anterior';
  intl.nextMonthLabel = 'Mes siguiente';
  intl.prevYearLabel = 'Año anterior';
  intl.nextYearLabel = 'Año siguiente';
  intl.prevMultiYearLabel = '24 años atrás';
  intl.nextMultiYearLabel = '24 años adelante';
  intl.switchToMonthViewLabel = 'Elegir día';
  intl.switchToMultiYearViewLabel = 'Elegir mes y año';
  return intl;
}

// Campo de fecha de toda la app: un mat-form-field con calendario
// (mat-datepicker) en español, semana desde el lunes y texto dd/mm/aaaa. Es
// el mismo en cualquier navegador: el calendario nativo de <input
// type="date"> sale en el idioma del navegador, no en el de la página.
//
// Hacia afuera es idéntico al <input type="date"> que reemplaza: el valor
// del FormControl/ngModel es el string 'YYYY-MM-DD' ('' si está vacío o a
// medio escribir). El Date vive solo acá adentro, así que fecha.util, los
// autocompletados y la API no se enteran del cambio. Escribir o elegir en el
// calendario marca el control como dirty; un setValue/patchValue desde
// código no (igual que cualquier input).
//
// El adaptador, el idioma y el formato se proveen en el componente y no en
// app.config: quedan limitados a los calendarios y el campo funciona igual
// en cualquier diálogo o test sin configuración extra.
//
// Se auto-registra como value accessor del NgControl (ver MetodoPagoSelect).
@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: FECHA_LOCALE },
    { provide: MAT_DATE_FORMATS, useValue: FECHA_DATE_FORMATS },
    { provide: DateAdapter, useClass: FechaDateAdapter },
    { provide: MatDatepickerIntl, useFactory: datepickerIntlEs },
  ],
  selector: 'app-fecha-field',
  styleUrl: './fecha-field.scss',
  templateUrl: './fecha-field.html',
})
export class FechaField implements ControlValueAccessor, OnInit {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  // Mensaje cuando el control es obligatorio y está vacío.
  readonly requiredError = input('La fecha es obligatoria.');
  // Mensajes de los demás validadores del control del formulario, por clave
  // de error: `{ futura: 'No puede ser una fecha futura.' }`.
  readonly errores = input<Record<string, string>>({});
  // Límites del calendario, en 'YYYY-MM-DD' como el valor.
  readonly min = input<string | null>();
  readonly max = input<string | null>();

  protected readonly minDate = computed(() => isoADate(this.min()));
  protected readonly maxDate = computed(() => isoADate(this.max()));
  // En celular el calendario se abre como diálogo táctil a pantalla
  // completa en vez de un desplegable pegado al campo.
  protected readonly isMobile = injectIsMobile();

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);

  // El control del <input> con el datepicker: trabaja con Date. El control
  // de afuera (el del formulario) solo ve el string.
  protected readonly inner = new FormControl<Date | null>(null);

  // El mat-form-field se pone en rojo según el control de AFUERA (que es el
  // que tiene los validadores del formulario), no solo según el de adentro.
  protected readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: () =>
      this.ngControl?.touched === true && (this.ngControl.invalid === true || this.inner.invalid),
  };

  // Ver MetodoPagoSelect: markAllAsTouched() y compañía no pasan por
  // signals; `control.events` sí avisa (ver refrescar()).
  private readonly controlTick = signal(0);
  protected readonly errorText = computed(() => {
    this.controlTick();
    if (this.inner.hasError('matDatepickerParse')) {
      return 'Escribe la fecha como día/mes/año, por ejemplo 05/03/2026.';
    }
    if (this.ngControl?.hasError('required') || this.inner.hasError('required')) {
      return this.requiredError();
    }
    for (const [clave, mensaje] of Object.entries(this.errores())) {
      if (this.ngControl?.hasError(clave)) {
        return mensaje;
      }
    }
    const min = this.min();
    if (min && this.inner.hasError('matDatepickerMin')) {
      return `No puede ser anterior al ${formatFechaCorta(min)}.`;
    }
    const max = this.max();
    if (max && this.inner.hasError('matDatepickerMax')) {
      return `No puede ser posterior al ${formatFechaCorta(max)}.`;
    }
    return '';
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    // Solo cambios hechos por la persona (escribir o elegir en el
    // calendario): writeValue() escribe sin emitir.
    this.inner.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((fecha) => this.onChange(dateAIso(fecha)));
    this.inner.events.pipe(takeUntilDestroyed()).subscribe(() => this.refrescar());
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }
    // Para que el mat-form-field muestre el asterisco de obligatorio.
    if (control.hasValidator(Validators.required)) {
      this.inner.addValidators(Validators.required);
      this.inner.updateValueAndValidity({ emitEvent: false });
    }
    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refrescar());
  }

  writeValue(value: string | null): void {
    this.inner.setValue(isoADate(value), { emitEvent: false });
    this.refrescar();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.inner.disable({ emitEvent: false });
    } else {
      this.inner.enable({ emitEvent: false });
    }
  }

  protected markTouched(): void {
    this.onTouched();
  }

  // Cambió el estado de alguno de los dos controles. El signal recalcula el
  // mensaje de error; markForCheck hace falta además para que el matInput
  // vuelva a evaluar errorMatcher (lo hace en su ngDoCheck, que no corre si
  // la vista solo se refresca por un signal).
  private refrescar(): void {
    this.controlTick.update((n) => n + 1);
    this.changeDetector.markForCheck();
  }
}
