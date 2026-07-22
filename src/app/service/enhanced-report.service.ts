import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnhancedReportData {
  totalTransactions: number;
  totalSalesAmount: number;
  averageTicket: number;
  categorySales: { categoryName: string; totalQuantity: number; totalAmount: number; percentage: number }[];
  hourlySales: { hour: number; rangeLabel: string; transactionCount: number; totalAmount: number }[];
  topProducts: { productName: string; categoryName: string; totalQuantity: number; totalAmount: number; rank: string }[];
  bottomProducts: { productName: string; categoryName: string; totalQuantity: number; totalAmount: number; rank: string }[];
  turnSales: { turnName: string; transactionCount: number; totalAmount: number; itemCount: number }[];
  paymentMethodBreakdown: { method: string; count: number; total: number; percentage: number }[];
  discounts: { saleId: number; colaborador: string; subtotal: number; discountAmount: number; total: number; paymentMethod: string; issueDate: string }[];
  lastCashClose: any;
}

@Injectable({ providedIn: 'root' })
export class EnhancedReportService {
  private apiUrl = '/api/admin/reports/enhanced';

  constructor(private http: HttpClient) {}

  getEnhancedReport(startDate: string, endDate: string): Observable<EnhancedReportData> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<EnhancedReportData>(this.apiUrl, { headers, params });
  }
}
