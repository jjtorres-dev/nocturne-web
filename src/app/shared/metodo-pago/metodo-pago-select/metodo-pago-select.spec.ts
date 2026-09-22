import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { HarnessLoader } from '@angular/cdk/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MetodoPagoSelect } from './metodo-pago-select';

@Component({
  imports: [ReactiveFormsModule, MetodoPagoSelect],
  template: `<app-metodo-pago-select [formControl]="control" />`,
})
class Host {
  readonly control = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
}

describe('MetodoPagoSelect', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  function select(): Promise<MatSelectHarness> {
    return loader.getHarness(MatSelectHarness);
  }

  function customInput(): HTMLInputElement | null {
    return fixture.nativeElement.querySelector('input[matInput]');
  }

  it('elegir una opción fija guarda su etiqueta exacta en el FormControl', async () => {
    const sel = await select();
    await sel.open();
    await sel.clickOptions({ text: 'Yape' });

    expect(host.control.value).toBe('Yape');
    expect(customInput()).toBeNull();
  });

  it('elegir "Otro" y escribir guarda el texto custom, nunca el sentinel', async () => {
    const sel = await select();
    await sel.open();
    await sel.clickOptions({ text: 'Otro' });
    fixture.detectChanges();

    // Recién elegido "Otro", sin texto todavía: nunca el string "Otro".
    expect(host.control.value).toBe('');

    const input = customInput()!;
    expect(input).not.toBeNull();
    input.value = 'Depósito en agencia';
    input.dispatchEvent(new Event('input'));

    expect(host.control.value).toBe('Depósito en agencia');
  });

  it('inicializar con un valor que coincide con una opción fija la selecciona', async () => {
    host.control.setValue('Zelle');
    fixture.detectChanges();

    const sel = await select();
    expect(await sel.getValueText()).toBe('Zelle');
    expect(customInput()).toBeNull();
  });

  it('inicializar con un valor que NO coincide cae en "Otro" con ese texto preservado', async () => {
    host.control.setValue('Depósito en agencia');
    fixture.detectChanges();

    const sel = await select();
    expect(await sel.getValueText()).toBe('Otro');
    expect(customInput()!.value).toBe('Depósito en agencia');
    // El FormControl conserva el valor original tal cual: no se corrompió.
    expect(host.control.value).toBe('Depósito en agencia');
  });

  it('inicializar sin valor (formulario de creación) no selecciona nada', async () => {
    const sel = await select();
    expect(await sel.getValueText()).toBe('');
    expect(customInput()).toBeNull();
  });

  it('muestra el error "obligatorio" solo después de tocar el campo, no de entrada', () => {
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();

    host.control.markAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-error')?.textContent).toContain(
      'El método de pago es obligatorio.',
    );
  });

  it('elegir una opción fija después de "Otro" quita el campo de texto', async () => {
    const sel = await select();
    await sel.open();
    await sel.clickOptions({ text: 'Otro' });
    fixture.detectChanges();
    expect(customInput()).not.toBeNull();

    await sel.open();
    await sel.clickOptions({ text: 'Efectivo' });
    fixture.detectChanges();

    expect(customInput()).toBeNull();
    expect(host.control.value).toBe('Efectivo');
  });
});
