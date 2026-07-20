import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';

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

      // 🟢 CAPTURAMOS LA PROPIEDAD REAL: 'role' en singular
      const singleRole = decodedPayload.role;

      // Como tu token manda un String plano (ej: "ADMIN"),
      // lo metemos dentro de un arreglo [] para que tu login siga funcionando con .includes()
      return singleRole ? [singleRole] : [];

    } catch (e) {
      console.error('Error al decodificar el token JWT:', e);
      return [];
    }
  }
}
