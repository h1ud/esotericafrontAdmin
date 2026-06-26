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

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/admin/users'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  listEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  createEmployee(emp: any): Observable<void> {
    return this.http.post<void>(this.apiUrl, emp);
  }

  updateEmployee(id: number, emp: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, emp);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listRoles(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/admin/roles'); // Ajusta a tu URL real
  }
}
