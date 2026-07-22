import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private apiUrl = '/api/pos/sales';

  constructor(private http: HttpClient) {}

  createSale(saleData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, saleData);
  }

  deleteSale(saleId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${saleId}`);
  }
}
