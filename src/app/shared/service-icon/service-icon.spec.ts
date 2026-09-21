import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceIcon } from './service-icon';

describe('ServiceIcon', () => {
  let fixture: ComponentFixture<ServiceIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ServiceIcon] }).compileComponents();
    fixture = TestBed.createComponent(ServiceIcon);
  });

  it('dibuja el SVG de la marca cuando el nombre coincide', () => {
    fixture.componentRef.setInput('nombre', 'Netflix 2 Meses');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('svg path')?.getAttribute('d')).toBeTruthy();
    expect(el.querySelector('app-avatar-inicial')).toBeNull();
  });

  it('cae al avatar de iniciales cuando no hay match', () => {
    fixture.componentRef.setInput('nombre', 'Servicio Inventado');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('svg')).toBeNull();
    expect(el.querySelector('app-avatar-inicial')?.textContent?.trim()).toBe('SI');
  });
});
