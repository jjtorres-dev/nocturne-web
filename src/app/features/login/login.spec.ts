import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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

  describe('estados al ingresar', () => {
    function el(): HTMLElement {
      return fixture.nativeElement;
    }

    function boton(): HTMLButtonElement {
      return el().querySelector<HTMLButtonElement>('.submit-button')!;
    }

    // Llena el formulario, lo envía y deja pendiente el POST /auth/login.
    function enviar() {
      component.form.setValue({ email: 'rosa@nocturne.dev', password: 'clave-segura' });
      const pending = component.submit();
      fixture.detectChanges();
      const req = TestBed.inject(HttpTestingController).expectOne((r) =>
        r.url.endsWith('/auth/login'),
      );
      return { pending, req };
    }

    async function fallar(status: number) {
      const { pending, req } = enviar();
      if (status === 0) {
        req.error(new ProgressEvent('error'));
      } else {
        req.flush({ message: 'x' }, { status, statusText: 'Error' });
      }
      await pending;
      fixture.detectChanges();
    }

    afterEach(() => {
      vi.useRealTimers();
    });

    it('mientras ingresa, el botón dice "Ingresando…" y queda deshabilitado', async () => {
      const { pending, req } = enviar();

      expect(component.loading()).toBe(true);
      expect(boton().textContent).toContain('Ingresando…');
      expect(boton().disabled).toBe(true);

      req.flush({ message: 'x' }, { status: 401, statusText: 'Unauthorized' });
      await pending;
    });

    it('401: avisa que el correo o la contraseña son incorrectos y deja reintentar', async () => {
      await fallar(401);

      const aviso = el().querySelector('.error-message')!;
      expect(aviso.textContent).toContain('Correo o contraseña incorrectos.');
      expect(aviso.getAttribute('role')).toBe('alert');
      expect(boton().disabled).toBe(false);
      expect(boton().textContent).toContain('Ingresar');
    });

    it('429: bloquea el botón con una cuenta regresiva y lo rehabilita al terminar', async () => {
      vi.useFakeTimers();
      await fallar(429);

      expect(el().querySelector('.error-message')!.textContent).toContain('Demasiados intentos');
      expect(component.espera()).toBe(60);
      expect(boton().disabled).toBe(true);
      expect(boton().textContent).toContain('Espera 60 s');

      vi.advanceTimersByTime(10_000);
      fixture.detectChanges();
      expect(boton().textContent).toContain('Espera 50 s');

      vi.advanceTimersByTime(50_000);
      fixture.detectChanges();
      expect(component.bloqueado()).toBe(false);
      expect(component.errorMessage()).toBeNull();
      expect(boton().disabled).toBe(false);
    });

    it('bloqueado, no vuelve a llamar al backend', async () => {
      vi.useFakeTimers();
      await fallar(429);

      await component.submit();

      TestBed.inject(HttpTestingController).expectNone((r) => r.url.endsWith('/auth/login'));
    });

    it('sin conexión: dice que no se pudo conectar, no que la contraseña está mal', async () => {
      await fallar(0);

      const texto = el().querySelector('.error-message')!.textContent;
      expect(texto).toContain('No se pudo conectar con el servidor');
      expect(texto).not.toContain('incorrectos');
    });

    it('500: dice que el problema es del servidor', async () => {
      await fallar(500);

      expect(el().querySelector('.error-message')!.textContent).toContain(
        'El servidor tuvo un problema',
      );
    });
  });

  describe('pantalla', () => {
    it('no ofrece crear una cuenta', () => {
      const texto: string = fixture.nativeElement.textContent.toLowerCase();
      expect(texto).not.toContain('crear cuenta');
      expect(texto).not.toContain('regístrate');
      expect(texto).toContain('pídeselo a tu administrador');
    });

    it('el botón del ojo muestra y oculta la contraseña', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const input = el.querySelector<HTMLInputElement>('input[autocomplete="current-password"]')!;
      const ojo = el.querySelector<HTMLButtonElement>('.ver-password')!;
      expect(input.type).toBe('password');
      expect(ojo.getAttribute('aria-label')).toBe('Mostrar contraseña');

      ojo.click();
      fixture.detectChanges();

      expect(input.type).toBe('text');
      expect(ojo.getAttribute('aria-label')).toBe('Ocultar contraseña');
    });

    it('con el marcador de 1×1 px muestra el letrero; con una imagen real, la imagen', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const img = el.querySelector<HTMLImageElement>('.letrero-imagen')!;
      expect(img.getAttribute('src')).toBe('login-marca.jpg');

      Object.defineProperty(img, 'naturalWidth', { value: 1, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 1, configurable: true });
      img.dispatchEvent(new Event('load'));
      fixture.detectChanges();
      expect(el.querySelector('.letrero-marca')?.textContent).toContain('Nocturne');
      expect(el.querySelector('.letrero--imagen')).toBeNull();

      Object.defineProperty(img, 'naturalWidth', { value: 1600, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 2000, configurable: true });
      img.dispatchEvent(new Event('load'));
      fixture.detectChanges();
      expect(el.querySelector('.letrero--imagen')).not.toBeNull();
      expect(el.querySelector('.letrero-marca')).toBeNull();
      expect(img.getAttribute('alt')).toBe('Nocturne');
    });

    it('con el teclado abierto (área visible mucho menor) compacta la pantalla', () => {
      const pagina: HTMLElement = fixture.nativeElement.querySelector('.login-page');

      component.onViewportResize(window.innerHeight * 0.5);
      fixture.detectChanges();
      expect(pagina.classList).toContain('teclado');

      component.onViewportResize(window.innerHeight);
      fixture.detectChanges();
      expect(pagina.classList).not.toContain('teclado');
    });
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
