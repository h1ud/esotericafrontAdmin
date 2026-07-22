import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnhancedReportService, EnhancedReportData } from '../../service/enhanced-report.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-enhanced-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enhanced-reports.html',
  styleUrls: ['./enhanced-reports.css'],
})
export class EnhancedReports {
  startDate: string = '';
  endDate: string = '';
  data = signal<EnhancedReportData | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  activeTab = signal<'resumen' | 'categorias' | 'horario' | 'productos' | 'turnos' | 'pagos' | 'descuentos'>('resumen');

  constructor(private reportService: EnhancedReportService) {}

  cargarReporte() {
    this.errorMessage.set('');
    if (!this.startDate || !this.endDate) {
      this.errorMessage.set('Selecciona ambas fechas.');
      return;
    }
    if (this.startDate > this.endDate) {
      this.errorMessage.set('La fecha de inicio no puede ser mayor que la fecha fin.');
      return;
    }
    this.isLoading.set(true);
    this.data.set(null);
    this.reportService.getEnhancedReport(this.startDate, this.endDate).subscribe({
      next: (d) => { this.data.set(d); this.isLoading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar el reporte.'); this.isLoading.set(false); },
    });
  }

  readonly tabs: { key: string; label: string }[] = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'categorias', label: 'Categorías' },
    { key: 'horario', label: 'Horario' },
    { key: 'productos', label: 'Productos' },
    { key: 'turnos', label: 'Turnos' },
    { key: 'pagos', label: 'Pagos' },
    { key: 'descuentos', label: 'Descuentos' },
  ];

  setTab(tab: any) {
    this.activeTab.set(tab);
  }

  formatCurrency(v: number): string {
    return 'S/ ' + (v ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getBarWidth(amount: number, max: number): string {
    if (max <= 0) return '0%';
    return Math.min((amount / max) * 100, 100) + '%';
  }

  // ── Excel Export with styling ──
  exportExcel() {
    const d = this.data();
    if (!d) return;
    const wb = XLSX.utils.book_new();

    const addSheet = (name: string, headers: string[], rows: any[], cols?: XLSX.ColInfo[]) => {
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      // Style header row
      ws['!cols'] = cols || headers.map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(wb, ws, name);
    };

    addSheet('Resumen', ['Métrica', 'Valor'], [
      ['Total Transacciones', String(d.totalTransactions)],
      ['Total Ventas', 'S/ ' + d.totalSalesAmount.toFixed(2)],
      ['Ticket Promedio', 'S/ ' + d.averageTicket.toFixed(2)],
    ]);

    addSheet('Categorías', ['Categoría', 'Cantidad', 'Total', '%'],
      d.categorySales.map(c => [c.categoryName, String(c.totalQuantity), 'S/ ' + c.totalAmount.toFixed(2), c.percentage + '%']));

    addSheet('Horario', ['Hora', 'Transacciones', 'Total'],
      d.hourlySales.map(h => [h.rangeLabel, String(h.transactionCount), 'S/ ' + h.totalAmount.toFixed(2)]));

    addSheet('Top Productos', ['#', 'Producto', 'Categoría', 'Cantidad', 'Total'],
      d.topProducts.map(p => [p.rank, p.productName, p.categoryName, String(p.totalQuantity), 'S/ ' + p.totalAmount.toFixed(2)]));

    addSheet('Método Pago', ['Método', 'Transacciones', 'Total', '%'],
      d.paymentMethodBreakdown.map(p => [p.method, String(p.count), 'S/ ' + p.total.toFixed(2), p.percentage + '%']));

    XLSX.writeFile(wb, `reporte_analitico_${this.startDate}_al_${this.endDate}.xlsx`);
  }

  // ── PDF Export ──
  exportPDF() {
    const d = this.data();
    if (!d) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = 190;
    let y = 15;
    const lineH = 7;

    const addTitle = (text: string) => {
      doc.setFontSize(14); doc.setTextColor(80, 50, 50); doc.text(text, 10, y); y += 8;
    };
    const addSubtitle = (text: string) => {
      doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.text(text, 10, y); y += 5;
    };
    const addRow = (label: string, value: string) => {
      doc.setFontSize(10); doc.setTextColor(60, 60, 60);
      doc.text(label, 15, y); doc.text(value, pageW - 10, y, { align: 'right' }); y += lineH;
    };
    const separator = () => { y += 2; doc.setDrawColor(220, 220, 220); doc.line(10, y, pageW, y); y += 4; };

    // Header
    doc.setFontSize(22); doc.setTextColor(80, 50, 50); doc.text('Esoterica POS', 10, y); y += 8;
    doc.setFontSize(11); doc.setTextColor(120, 120, 120);
    doc.text('Reporte Analítico del Negocio', 10, y); y += 6;
    doc.text(`${this.startDate} al ${this.endDate}`, 10, y); y += 10;

    // Summary
    addTitle('Resumen General');
    addRow('Total Transacciones:', String(d.totalTransactions));
    addRow('Total Ventas:', 'S/ ' + d.totalSalesAmount.toFixed(2));
    addRow('Ticket Promedio:', 'S/ ' + d.averageTicket.toFixed(2));
    y += 4;

    // Category Sales
    if (d.categorySales.length > 0) {
      separator();
      addTitle('Ventas por Categoría');
      d.categorySales.forEach(c => addRow(c.categoryName + ' (' + c.totalQuantity + ' uds)', 'S/ ' + c.totalAmount.toFixed(2) + ' (' + c.percentage + '%)'));
    }

    // Top products
    if (d.topProducts.length > 0) {
      separator();
      addTitle('Top Productos');
      d.topProducts.forEach(p => addRow(p.rank + ' ' + p.productName, 'S/ ' + p.totalAmount.toFixed(2) + ' (' + p.totalQuantity + ' uds)'));
    }

    // Payment methods
    if (d.paymentMethodBreakdown.length > 0) {
      separator();
      addTitle('Métodos de Pago');
      d.paymentMethodBreakdown.forEach(p => addRow(p.method + ' (' + p.count + ' tx)', 'S/ ' + p.total.toFixed(2) + ' (' + p.percentage + '%)'));
    }

    // Turn sales
    if (d.turnSales.length > 0) {
      separator();
      addTitle('Ventas por Turno');
      d.turnSales.forEach(t => addRow(t.turnName, 'S/ ' + t.totalAmount.toFixed(2) + ' (' + t.transactionCount + ' tx)'));
    }

    // Hourly
    if (d.hourlySales.length > 0) {
      separator();
      addTitle('Análisis por Horario');
      d.hourlySales.forEach(h => addRow(h.rangeLabel, 'S/ ' + h.totalAmount.toFixed(2) + ' (' + h.transactionCount + ' tx)'));
    }

    doc.save(`reporte_analitico_${this.startDate}_al_${this.endDate}.pdf`);
  }
}
