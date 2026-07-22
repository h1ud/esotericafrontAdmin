import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth/login';

  constructor(private http: HttpClient) {}

  login(credentials: any) {
    return this.http.post<{ token: string }>(this.apiUrl, credentials).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token); // se guarda el token localstorage
      }),
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRoles(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const singleRole = decodedPayload.role;
      return singleRole ? [singleRole] : [];
    } catch (e) {
      console.error('Error al decodificar el token JWT:', e);
      return [];
    }
  }

  /** Obtiene el nombre completo del usuario desde el JWT */
  getUserFullName(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const name = decodedPayload.name || '';
      const lastName = decodedPayload.lastName || '';
      return (name + ' ' + lastName).trim() || decodedPayload.sub || '';
    } catch (e) {
      return '';
    }
  }

  /** Obtiene el username desde el JWT */
  getUsername(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return decodedPayload.sub || '';
    } catch (e) {
      return '';
    }
  }
}
