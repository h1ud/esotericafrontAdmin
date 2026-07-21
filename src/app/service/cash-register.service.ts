import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CashOpenRequest {
  initialAmount: number;
  notes?: string;
}

export interface CashStatus {
  isOpen: boolean;
  cashOpeningId: number | null;
  openedBy: string | null;
  openedByName: string | null;
  openedAt: string | null;
  initialAmount: number;
  totalEfectivo: number;
  totalYapePlin: number;
  totalSales: number;
  transactionCount: number;
}

export interface CashCloseSummary {
  cashOpeningId: number;
  openedBy: string;
  openedByName: string;
  openedAt: string;
  closedAt: string;
  initialAmount: number;
  totalEfectivo: number;
  totalYapePlin: number;
  totalSales: number;
  totalTransactions: number;
  expectedCash: number;
  notes: string;
  sales: CashSaleLine[];
}

export interface CashSaleLine {
  saleId: number;
  paymentMethod: string;
  total: number;
  issueDate: string;
  itemCount: number;
}

export interface CashClosingAdmin {
  id: number;
  userName: string;
  userFullName: string;
  openedAt: string;
  closedAt: string;
  initialAmount: number;
  totalEfectivo: number;
  totalYapePlin: number;
  total: number;
  transactionCount: number;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  constructor(private http: HttpClient) {}

  getStatus(): Observable<CashStatus> {
    return this.http.get<CashStatus>('/api/pos/cash/status');
  }

  openCashRegister(request: CashOpenRequest): Observable<CashStatus> {
    return this.http.post<CashStatus>('/api/pos/cash/open', request);
  }

  closeCashRegister(notes?: string): Observable<CashCloseSummary> {
    return this.http.post<CashCloseSummary>('/api/pos/cash/close', { notes: notes || '' });
  }

  getAllClosings(): Observable<CashClosingAdmin[]> {
    return this.http.get<CashClosingAdmin[]>('/api/admin/cash/closings');
  }
}
