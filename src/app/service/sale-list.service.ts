import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SaleItemResponse {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleResponse {
  id: number;
  userName: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  issueDate: string;
  items: SaleItemResponse[];
}

export interface DashboardData {
  today: {
    transactionCount: number;
    totalAmount: number;
  };
  weekSales: {
    date: string;
    transactions: number;
    total: number;
  }[];
  month: {
    totalAmount: number;
    transactionCount: number;
    totalEfectivo: number;
    totalYapePlin: number;
    efectivoAmount: number;
    yapePlinAmount: number;
  };
  totalProducts: number;
  totalClients: number;
  paymentBreakdown: {
    method: string;
    count: number;
    total: number;
  }[];
  recentActivity: {
    title: string;
    meta: string;
    timestamp: string;
    type: string;
  }[];
}

export interface SalesPageData {
  sales: SaleResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class SaleListService {
  private readonly recentUrl = '/api/pos/sales/recent';
  private readonly dashboardUrl = '/api/admin/statistics/dashboard';
  private readonly allSalesUrl = '/api/admin/sales';

  constructor(private http: HttpClient) {}

  getRecentSales(): Observable<SaleResponse[]> {
    return this.http.get<SaleResponse[]>(this.recentUrl);
  }

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.dashboardUrl);
  }

  getSalesPage(page: number = 0, size: number = 20): Observable<SalesPageData> {
    return this.http.get<SalesPageData>(`${this.allSalesUrl}?page=${page}&size=${size}`);
  }
}
