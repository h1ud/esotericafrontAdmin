import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id?: number;
  username: string;
  name: string;
  lastName: string;
  idRole: number;
  roleName?: string;
  createDate?: string;
}

export interface Role {
  id: number;
  roleName: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/admin/users';

  constructor(private http: HttpClient) {}

  listEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  createEmployee(emp: any): Observable<void> {
    return this.http.post<void>(this.apiUrl, emp);
  }

  // 🔄 Cambiado de <any> a <void> para acoplarse al ResponseEntity<Void> del backend
  updateEmployee(id: number, emp: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, emp);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 🔄 Tipado con la interfaz Role para mayor control en tu HTML
  listRoles(): Observable<Role[]> {
    return this.http.get<Role[]>('http://localhost:8080/api/admin/roles');
  }
}
