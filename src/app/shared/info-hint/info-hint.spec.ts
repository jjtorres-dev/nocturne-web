import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoHint } from './info-hint';
import { InfoToggle } from './info-toggle';

@Component({
  imports: [InfoHint, InfoToggle],
  template: `
    <app-info-toggle [for]="hint" etiqueta="Qué es el costo" />
    <app-info-hint #hint texto="Lo que pagaste al proveedor." />
  `,
})
class Host {}

describe('InfoHint + InfoToggle', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');
  const texto = (): HTMLElement | null => fixture.nativeElement.querySelector('.info-hint');

  it('arranca oculto y con aria-expanded=false', () => {
    expect(texto()).toBeNull();
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(button().getAttribute('aria-label')).toBe('Qué es el costo');
  });

  it('un click (o toque) lo muestra y otro lo oculta, sin depender de hover', () => {
    button().click();
    fixture.detectChanges();
    expect(texto()?.textContent).toContain('Lo que pagaste al proveedor.');
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(button().getAttribute('aria-controls')).toBe(texto()?.id);

    button().click();
    fixture.detectChanges();
    expect(texto()).toBeNull();
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });

  it('pasar el mouse por encima no muestra nada', () => {
    button().dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(texto()).toBeNull();
  });
});
