import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PasswordResetData {
  id?: number;
  name: string;
  lastName: string;
  username: string;
  email: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private apiUrl = 'http://localhost:8080/api/password-resets';

  constructor(private http: HttpClient) {}

  createRequest(request: PasswordResetData): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  listRequests(): Observable<PasswordResetData[]> {
    return this.http.get<PasswordResetData[]>(this.apiUrl);
  }
}
