import {
  Component,
  DestroyRef,
  type ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth } from '../../core/auth/auth';

// El backend limita el login a 5 intentos por minuto (LoginThrottlerGuard):
// al pasarse responde 429 y hay que esperar este tiempo.
const ESPERA_SEGUNDOS = 60;

// Con el teclado en pantalla el área visible baja bastante más que esto; las
// barras del navegador, al ocultarse o mostrarse, la mueven mucho menos.
const TECLADO_RATIO = 0.75;

@Component({
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formEl = viewChild<ElementRef<HTMLFormElement>>('formEl');

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(this.readInfoMessage());
  // 'ok': algo salió bien (contraseña cambiada). 'aviso': la sesión expiró.
  protected readonly infoKind = computed(() =>
    this.route.snapshot.queryParamMap.get('passwordChanged') ? 'ok' : 'aviso',
  );
  protected readonly verPassword = signal(false);

  // Segundos que faltan para poder reintentar tras un 429 (0 = sin bloqueo).
  readonly espera = signal(0);
  readonly bloqueado = computed(() => this.espera() > 0);
  private esperaTimer: ReturnType<typeof setInterval> | null = null;

  // true cuando public/login-marca.jpg ya es una imagen real y no el
  // marcador de 1×1 px que viene con el repo.
  protected readonly imagenLista = signal(false);

  // En celular, con el teclado abierto: la banda de la marca se reduce y el
  // formulario sube, para que los campos y el botón no queden tapados.
  protected readonly tecladoAbierto = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    const viewport = window.visualViewport;
    if (viewport) {
      const onResize = () => this.onViewportResize(viewport.height);
      viewport.addEventListener('resize', onResize);
      inject(DestroyRef).onDestroy(() => viewport.removeEventListener('resize', onResize));
    }
    inject(DestroyRef).onDestroy(() => this.detenerEspera());
  }

  // `passwordChanged` (cambio de contraseña, ver Auth.logout) y
  // `sessionExpired` (refresh fallido, ver Auth.handleSessionExpired) son
  // avisos distintos: el primero no es un error de la sesión.
  private readInfoMessage(): string | null {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('passwordChanged')) {
      return 'Contraseña actualizada. Inicia sesión de nuevo.';
    }
    if (params.get('sessionExpired')) {
      return 'Tu sesión expiró, inicia sesión de nuevo.';
    }
    return null;
  }

  protected onImagenCargada(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.imagenLista.set(img.naturalWidth > 1 && img.naturalHeight > 1);
  }

  // Sin `private`: el test lo llama directo con la altura visible.
  onViewportResize(altoVisible: number): void {
    const abierto = altoVisible < window.innerHeight * TECLADO_RATIO;
    this.tecladoAbierto.set(abierto);
    if (abierto) {
      // Tras reducirse la banda, deja el formulario entero dentro de lo visible.
      requestAnimationFrame(() =>
        this.formEl()?.nativeElement.scrollIntoView?.({ block: 'start' }),
      );
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading() || this.bloqueado()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    // Un aviso de la visita anterior ya no aplica al intentar entrar.
    this.infoMessage.set(null);

    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.loading.set(false);
    }
  }

  private mostrarError(error: unknown): void {
    const status = error instanceof HttpErrorResponse ? error.status : null;
    if (status === 429) {
      this.iniciarEspera();
    } else if (status === 0) {
      this.errorMessage.set(
        'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      );
    } else if (status !== null && status >= 500) {
      this.errorMessage.set('El servidor tuvo un problema. Inténtalo de nuevo en un momento.');
    } else {
      this.errorMessage.set('Correo o contraseña incorrectos.');
    }
  }

  // Cuenta regresiva del bloqueo: el botón se rehabilita solo al terminar.
  private iniciarEspera(): void {
    this.detenerEspera();
    this.espera.set(ESPERA_SEGUNDOS);
    this.errorMessage.set(
      'Demasiados intentos. Espera un minuto antes de volver a intentar.',
    );
    this.esperaTimer = setInterval(() => {
      this.espera.update((s) => s - 1);
      if (this.espera() <= 0) {
        this.detenerEspera();
        this.errorMessage.set(null);
      }
    }, 1000);
  }

  private detenerEspera(): void {
    if (this.esperaTimer !== null) {
      clearInterval(this.esperaTimer);
      this.esperaTimer = null;
    }
    this.espera.set(0);
  }
}
