import { Service, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

const TOKEN_STORAGE_KEY = 'nocturne_access_token';
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

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      }),
    );
    localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    this.currentUserSignal.set(response.user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
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
