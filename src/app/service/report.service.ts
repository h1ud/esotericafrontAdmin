import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SaleReportDTO {
  issueDate: string;
  colaborador: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  // La URL debe coincidir con la del backend
  private apiUrl = 'http://localhost:8080/api/admin/reports';

  constructor(private http: HttpClient) {}

  obtenerReporte(type: string, startDate: string, endDate: string): Observable<any[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const params = new HttpParams()
      .set('type', type)
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any[]>(this.apiUrl, { headers, params });
  }
}
