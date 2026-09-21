import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyState] }).compileComponents();
    fixture = TestBed.createComponent(EmptyState);
  });

  it('muestra ícono, mensaje y submensaje', () => {
    fixture.componentRef.setInput('icon', 'group');
    fixture.componentRef.setInput('mensaje', 'No hay nada.');
    fixture.componentRef.setInput('submensaje', 'Prueba otra cosa.');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('group');
    expect(el.querySelector('.mensaje')?.textContent).toContain('No hay nada.');
    expect(el.querySelector('.submensaje')?.textContent).toContain('Prueba otra cosa.');
  });

  it('omite el submensaje cuando no se pasa y usa un ícono por defecto', () => {
    fixture.componentRef.setInput('mensaje', 'No hay nada.');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.submensaje')).toBeNull();
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('inbox');
  });
});
