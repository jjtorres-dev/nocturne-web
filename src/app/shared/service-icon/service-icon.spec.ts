import { ComponentFixture, TestBed } from '@angular/core/testing';
import { colorAvatar } from '../avatar-inicial/avatar-inicial.util';
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

  it('Disney+ dibuja el logo real desde el asset local, sin avatar', () => {
    fixture.componentRef.setInput('nombre', 'Disney+');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const img = el.querySelector('img');
    expect(img?.getAttribute('src')).toBe('service-icons/disney-plus.svg');
    expect(img?.classList).toContain('full-bleed');
    expect(el.querySelector('app-avatar-inicial')).toBeNull();
  });

  it('Prime Video dibuja el logo real desde el asset local, sin avatar', () => {
    fixture.componentRef.setInput('nombre', 'Prime Video');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('img')?.getAttribute('src')).toBe('service-icons/prime-video-alt.svg');
    expect(el.querySelector('app-avatar-inicial')).toBeNull();
  });

  it('un servicio sin ícono sigue con el avatar de iniciales y el color por hash', () => {
    fixture.componentRef.setInput('nombre', 'IPTV Premium');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const avatar: HTMLElement = el.querySelector('app-avatar-inicial .avatar')!;
    const probe = document.createElement('span');
    probe.style.backgroundColor = colorAvatar('IPTV Premium');

    expect(el.querySelector('svg, img')).toBeNull();
    expect(avatar.style.backgroundColor).toBe(probe.style.backgroundColor);
  });
});
