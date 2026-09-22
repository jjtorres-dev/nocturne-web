import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no envía el formulario si es inválido', async () => {
    await component.submit();
    expect(component.errorMessage()).toBeNull();
  });

  it('no muestra mensaje de sesión expirada sin el query param', () => {
    expect(component.infoMessage()).toBeNull();
  });
});

describe('Login con sesión expirada', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ sessionExpired: '1' }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('muestra el aviso de sesión expirada cuando llega el query param', () => {
    expect(component.infoMessage()).toBe('Tu sesión expiró, inicia sesión de nuevo.');
  });
});

describe('Login tras cambiar la contraseña', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  async function setup(queryParams: Record<string, string>) {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('muestra "Contraseña actualizada. Inicia sesión de nuevo." con ?passwordChanged=1', async () => {
    await setup({ passwordChanged: '1' });

    expect(component.infoMessage()).toBe('Contraseña actualizada. Inicia sesión de nuevo.');
    expect(fixture.nativeElement.querySelector('.info-message').textContent).toContain(
      'Contraseña actualizada. Inicia sesión de nuevo.',
    );
  });

  it('es un aviso distinto al de sesión expirada', async () => {
    await setup({ passwordChanged: '1' });
    const passwordChanged = component.infoMessage();
    TestBed.resetTestingModule();

    await setup({ sessionExpired: '1' });

    expect(component.infoMessage()).toBe('Tu sesión expiró, inicia sesión de nuevo.');
    expect(component.infoMessage()).not.toBe(passwordChanged);
  });
});
