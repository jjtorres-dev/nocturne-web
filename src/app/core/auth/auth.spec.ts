import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('empieza sin usuario autenticado', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});
