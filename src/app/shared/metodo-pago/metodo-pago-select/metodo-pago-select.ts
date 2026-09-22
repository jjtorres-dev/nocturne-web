import { Component, DestroyRef, computed, inject, signal, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ControlValueAccessor } from '@angular/forms';
import { NgControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { METODO_PAGO_OPTIONS, METODO_PAGO_OTRO } from '../metodo-pago.data';

// Selector de "Método de pago": las 9 opciones fijas + "Otro" con texto
// libre debajo. Se auto-registra como value accessor del NgControl con el
// que se use (formControlName/ngModel) en vez de proveer NG_VALUE_ACCESSOR
// con forwardRef — evita el ciclo de DI y es el patrón recomendado para
// standalone components.
//
// El valor que entra/sale por el FormControl es siempre el string final
// (la etiqueta fija, o el texto custom): el sentinel "Otro" nunca se expone
// hacia afuera, solo identifica la opción seleccionada del <mat-select>.
@Component({
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule],
  selector: 'app-metodo-pago-select',
  styleUrl: './metodo-pago-select.scss',
  templateUrl: './metodo-pago-select.html',
})
export class MetodoPagoSelect implements ControlValueAccessor, OnInit {
  protected readonly options = METODO_PAGO_OPTIONS;
  protected readonly OTRO = METODO_PAGO_OTRO;

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  // null = nada elegido todavía (formulario de creación, sin tocar).
  protected readonly selected = signal<string | null>(null);
  protected readonly customText = signal('');
  protected readonly disabled = signal(false);

  // markAsTouched()/markAllAsTouched() sobre el control (como hace
  // form.markAllAsTouched() en el submit de todos estos diálogos) no pasan
  // por Zone.js ni por signals: son mutaciones planas sobre AbstractControl,
  // así que un getter leído en el template no se refresca de forma
  // confiable. `control.events` sí emite ante ese cambio — se usa para
  // empujar un signal y que showRequiredError (computed) se recalcule.
  private readonly controlTick = signal(0);
  protected readonly showRequiredError = computed(() => {
    this.controlTick();
    return (
      !!this.ngControl &&
      this.ngControl.hasError('required') &&
      (this.ngControl.touched === true || this.ngControl.dirty === true)
    );
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    // El value accessor hay que fijarlo en el constructor (no en ngOnInit):
    // tiene que estar listo antes de que el ngOnChanges de la directiva de
    // forms (FormControlName/FormControlDirective/NgModel) llame a
    // setUpControl(), que es lo que dispara el primer writeValue().
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    // A diferencia del valueAccessor, `ngControl.control` (el FormControl
    // real) recién queda armado después de esa misma fase de inputs/
    // ngOnChanges — en el constructor todavía es undefined. ngOnInit ya
    // corre después, así que acá sí está disponible.
    this.ngControl?.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.controlTick.update((n) => n + 1));
  }

  writeValue(value: string | null): void {
    const v = value ?? '';
    if (!v) {
      this.selected.set(null);
      this.customText.set('');
    } else if (this.options.includes(v)) {
      this.selected.set(v);
      this.customText.set('');
    } else {
      // No matchea ninguna opción fija: "Otro" con el valor tal cual, para
      // no perder ni corromper datos viejos al abrir el formulario de editar.
      this.selected.set(this.OTRO);
      this.customText.set(v);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onSelectChange(value: string): void {
    this.selected.set(value);
    this.emit();
  }

  protected onCustomTextChange(event: Event): void {
    this.customText.set((event.target as HTMLInputElement).value);
    this.emit();
  }

  protected markTouched(): void {
    this.onTouched();
  }

  private emit(): void {
    const value = this.selected() === this.OTRO ? this.customText() : (this.selected() ?? '');
    this.onChange(value);
  }
}
