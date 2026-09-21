import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceIconStack } from './service-icon-stack';

describe('ServiceIconStack', () => {
  let fixture: ComponentFixture<ServiceIconStack>;

  const servicios = (nombres: string[]) => nombres.map((nombre, i) => ({ id: `s${i}`, nombre }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ServiceIconStack] }).compileComponents();
    fixture = TestBed.createComponent(ServiceIconStack);
  });

  it('muestra un ícono o avatar por servicio, con su nombre como aria-label', () => {
    fixture.componentRef.setInput('servicios', servicios(['Netflix', 'Disney+']));
    fixture.detectChanges();

    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.item'));
    expect(items.map((i) => i.getAttribute('aria-label'))).toEqual(['Netflix', 'Disney+']);
    expect(items[0].querySelector('svg')).not.toBeNull(); // Netflix: ícono de marca
    expect(items[1].querySelector('app-avatar-inicial')).not.toBeNull(); // Disney+: avatar
  });

  it('colapsa el excedente en un "+N"', () => {
    fixture.componentRef.setInput('servicios', servicios(['A', 'B', 'C', 'D', 'E', 'F', 'G']));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('app-service-icon').length).toBe(5);
    expect(el.querySelector('.more')?.textContent?.trim()).toBe('+2');
  });
});
