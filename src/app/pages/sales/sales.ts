import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleListService, SaleResponse, SalesPageData } from '../../service/sale-list.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.html',
  styleUrl: './sales.css',
})
export class Sales implements OnInit {
  sales: SaleResponse[] = [];
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 20;

  loading: boolean = false;
  errorMessage: string = '';
  searchTerm: string = '';
  paymentFilter: string = '';
  
  /** For sale detail expand */
  expandedSaleId: number | null = null;

  constructor(
    private saleListService: SaleListService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.saleListService.getSalesPage(page, this.pageSize).subscribe({
      next: (data: SalesPageData) => {
        this.sales = data.sales;
        this.currentPage = data.currentPage;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.pageSize = data.pageSize;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error al cargar las ventas. Verifique la conexion con el servidor.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.loadPage(page);
  }

  toggleDetail(saleId: number): void {
    this.expandedSaleId = this.expandedSaleId === saleId ? null : saleId;
    this.cdr.detectChanges();
  }

  getPaymentMethodLabel(method: string): string {
    switch (method?.toLowerCase()) {
      case 'efectivo': return 'Efectivo';
      case 'yape_plin': return 'Yape / Plin';
      default: return method || '-';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pagado': return 'status-paid';
      case 'pendiente': return 'status-pending';
      case 'anulado': return 'status-cancelled';
      default: return '';
    }
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '--';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get totalFormatted(): string {
    const total = this.sales.reduce((sum, s) => sum + s.total, 0);
    return total.toLocaleString('es-PE', { minimumFractionDigits: 2 });
  }
}
