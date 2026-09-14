import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SecretValue } from './secret-value';

describe('SecretValue', () => {
  let fixture: ComponentFixture<SecretValue>;
  let component: SecretValue;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretValue],
      providers: [{ provide: MatSnackBar, useValue: { open: vi.fn() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(SecretValue);
    component = fixture.componentInstance;
  });

  it('no muestra el valor real en el DOM hasta presionar Mostrar', () => {
    fixture.componentRef.setInput('value', 'super-secreto');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('super-secreto');
    expect(fixture.nativeElement.textContent).toContain('••••••••');

    component.toggle();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('super-secreto');
  });

  it('vuelve a ocultar el valor al presionar Ocultar', () => {
    fixture.componentRef.setInput('value', 'super-secreto');
    fixture.detectChanges();

    component.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('super-secreto');

    component.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('super-secreto');
  });

  it('copia el valor al portapapeles sin revelarlo', async () => {
    fixture.componentRef.setInput('value', 'super-secreto');
    fixture.componentRef.setInput('label', 'Clave');
    fixture.detectChanges();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await component.copy();

    expect(writeText).toHaveBeenCalledWith('super-secreto');
    expect(fixture.nativeElement.textContent).not.toContain('super-secreto');
  });

  it('muestra un guion cuando no hay valor', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('—');
  });
});
