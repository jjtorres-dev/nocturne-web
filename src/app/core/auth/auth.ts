import { Service, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  map,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';

// Mismos valores que UserRole en el backend (src/users/user-role.enum.ts).
export enum UserRole {
  ADMIN = 'admin',
  REVENDEDOR = 'revendedor',
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Motivo por el que la sesión se cierra a propósito; /login lo lee del query
// param para mostrar un aviso distinto al de "sesión expirada".
export type LogoutReason = 'passwordChanged';

const ACCESS_TOKEN_STORAGE_KEY = 'nocturne_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'nocturne_refresh_token';
const USER_STORAGE_KEY = 'nocturne_user';

@Service()
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<AuthenticatedUser | null>(
    this.readStoredUser(),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  private refreshInProgress$: Observable<string> | null = null;

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      }),
    );
    this.setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }

  /** Refresca el access token. Si ya hay un refresh en curso, comparte ese mismo resultado. */
  refreshAccessToken(): Observable<string> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleSessionExpired();
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    this.refreshInProgress$ = this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => this.setTokens(response.accessToken, response.refreshToken)),
        map((response) => response.accessToken),
        catchError((error: unknown) => {
          this.handleSessionExpired();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshInProgress$ = null;
        }),
        // Comparte una única petición HTTP entre todos los suscriptores concurrentes.
        shareReplay(1),
      );

    return this.refreshInProgress$;
  }

  /**
   * Cambia la contraseña del usuario logueado. El backend revoca todos sus
   * refresh tokens (también el de esta sesión): quien llama debe cerrar la
   * sesión después (`logout('passwordChanged')`). Una contraseña actual
   * incorrecta llega como HttpErrorResponse 400 con el mensaje del backend.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiUrl}/auth/change-password`, {
        currentPassword,
        newPassword,
      }),
    );
  }

  /** Logout iniciado por el usuario: intenta revocar en el servidor, pero nunca bloquea el logout local. */
  async logout(reason?: LogoutReason): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }),
        );
      } catch {
        // Sin conexión o token ya inválido: igual limpiamos la sesión local.
      }
    }
    this.clearSession();
    if (reason) {
      this.router.navigate(['/login'], { queryParams: { [reason]: '1' } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  /** Invocado cuando el refresh también falla con 401: limpia todo y manda a /login con aviso. */
  private handleSessionExpired(): void {
    this.clearSession();
    this.router.navigate(['/login'], { queryParams: { sessionExpired: '1' } });
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  private readStoredUser(): AuthenticatedUser | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  }
}
