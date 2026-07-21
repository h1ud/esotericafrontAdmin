import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  // Asegúrate de que esta URL coincida con tu backend
  private apiUrl = '/api/pos/sales';

  constructor(private http: HttpClient) {}

  // Este método recibe el objeto que preparaste en tu componente
  createSale(saleData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, saleData);
  }
}
