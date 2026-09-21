import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarInicial } from './avatar-inicial';

describe('AvatarInicial', () => {
  let fixture: ComponentFixture<AvatarInicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AvatarInicial] }).compileComponents();
    fixture = TestBed.createComponent(AvatarInicial);
  });

  function render(nombre: string, size?: number): HTMLElement {
    fixture.componentRef.setInput('nombre', nombre);
    if (size) {
      fixture.componentRef.setInput('size', size);
    }
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.avatar');
  }

  it('muestra las iniciales y el color determinístico del nombre', () => {
    const avatar = render('Ana Torres');

    expect(avatar.textContent?.trim()).toBe('AT');
    expect(avatar.style.backgroundColor).not.toBe('');
    // Mismo nombre => mismo color aplicado en el DOM
    const again = TestBed.createComponent(AvatarInicial);
    again.componentRef.setInput('nombre', 'Ana Torres');
    again.detectChanges();
    expect(again.nativeElement.querySelector('.avatar').style.backgroundColor).toBe(
      avatar.style.backgroundColor,
    );
  });

  it('respeta el tamaño y es decorativo (aria-hidden)', () => {
    const avatar = render('Ana', 40);

    expect(avatar.style.width).toBe('40px');
    expect(avatar.style.height).toBe('40px');
    expect(avatar.getAttribute('aria-hidden')).toBe('true');
  });
});
