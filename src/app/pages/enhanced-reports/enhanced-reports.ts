import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnhancedReportService, EnhancedReportData } from '../../service/enhanced-report.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Workbook } from '@node-projects/excelforge';

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

  
  private readonly donutR = 40;
  private get donutCircumference(): number {
    return 2 * Math.PI * this.donutR;
  }

  getDonutDash(pct: number, items: any[]): string {
    if (items.length === 0) return '0 ' + this.donutCircumference;
    return (pct / 100 * this.donutCircumference) + ' ' + this.donutCircumference;
  }

  getDonutOffset(idx: number, items: any[]): number {
    let offset = 0;
    for (let i = 0; i < idx; i++) {
      offset += (items[i]?.percentage || 0) / 100 * this.donutCircumference;
    }
    return -offset;
  }

  getChartColor(idx: number): string {
    const colors = ['#8C6767', '#B98D8D', '#C2D2CA', '#A594B0', '#D8B7B7', '#987274', '#CCBED5', '#7C5A5B'];
    return colors[idx % colors.length];
  }

  
  private readonly lineChartH = 160;
  private readonly lineChartPad = 20;

  private getLineMax(values: number[]): number {
    return Math.max(...values, 1);
  }

  private getLineStepX(total: number): number {
    return 400 / total;
  }

  getLinePoints(values: number[]): string {
    if (values.length === 0) return '';
    const max = this.getLineMax(values);
    const stepX = this.getLineStepX(values.length);
    return values.map((v, i) => {
      const x = i * stepX + stepX / 2;
      const y = this.lineChartH - (v / max) * (this.lineChartH - this.lineChartPad);
      return `${x},${y}`;
    }).join(' ');
  }

  getLineX(idx: number, total: number): number {
    const stepX = this.getLineStepX(total);
    return idx * stepX + stepX / 2;
  }

  getLineY(value: number, values: number[]): number {
    const max = this.getLineMax(values);
    return this.lineChartH - (value / max) * (this.lineChartH - this.lineChartPad);
  }

  
  getHeatColor(value: number, max: number): string {
    if (max <= 0) return '#F9F5F0';
    const intensity = Math.min(value / max, 1);
    if (intensity < 0.25) return '#EBE5F0';
    if (intensity < 0.5) return '#D8B7B7';
    if (intensity < 0.75) return '#B98D8D';
    return '#8C6767';
  }

  
  maxCatQty(): number {
    const d = this.data();
    return Math.max(...(d?.categorySales.map(c => c.totalQuantity) || [1]), 1);
  }

  maxHourTx(): number {
    const d = this.data();
    return Math.max(...(d?.hourlySales.map(h => h.transactionCount) || [1]), 1);
  }

  maxTurnAmt(): number {
    const d = this.data();
    return Math.max(...(d?.turnSales.map(t => t.totalAmount) || [1]), 1);
  }

  maxTurnTx(): number {
    const d = this.data();
    return Math.max(...(d?.turnSales.map(t => t.transactionCount) || [1]), 1);
  }

  maxPayTx(): number {
    const d = this.data();
    return Math.max(...(d?.paymentMethodBreakdown.map(p => p.count) || [1]), 1);
  }

  maxPayAmt(): number {
    const d = this.data();
    return Math.max(...(d?.paymentMethodBreakdown.map(p => p.total) || [1]), 1);
  }

  
  getTotalDiscounts(discounts: any[]): number {
    return discounts.reduce((sum, d) => sum + d.discountAmount, 0);
  }

  getAvgDiscount(discounts: any[]): number {
    if (discounts.length === 0) return 0;
    return this.getTotalDiscounts(discounts) / discounts.length;
  }

  getDiscountByUser(discounts: any[]): { user: string; total: number; count: number }[] {
    const map = new Map<string, { user: string; total: number; count: number }>();
    discounts.forEach(d => {
      const existing = map.get(d.colaborador) || { user: d.colaborador, total: 0, count: 0 };
      existing.total += d.discountAmount;
      existing.count++;
      map.set(d.colaborador, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  getProductPct(amount: number, products: any[]): string {
    const total = products.reduce((sum, p) => sum + p.totalAmount, 0);
    if (total <= 0) return '0.0';
    return ((amount / total) * 100).toFixed(1);
  }

  
  async exportExcel() {
    const d = this.data();
    if (!d) return;

    
    const wb = new Workbook();

    const addSheet = (name: string, headers: string[], rows: any[][]) => {
      const ws = wb.addSheet(name);
      const data = [headers, ...rows];
      ws.writeArray(1, 1, data);
      headers.forEach((_, i) => ws.setColumnWidth(i + 1, 20));
      return ws;
    };

    
    addSheet('Resumen', ['Metrica', 'Valor'], [
      ['Total Transacciones', String(d.totalTransactions)],
      ['Total Ventas', 'S/ ' + d.totalSalesAmount.toFixed(2)],
      ['Ticket Promedio', 'S/ ' + d.averageTicket.toFixed(2)],
    ]);

    
    const catSheet = addSheet('Categorias', ['Categoria', 'Cantidad', 'Total', '%'],
      d.categorySales.map(c => [c.categoryName, c.totalQuantity, c.totalAmount, c.percentage]));
    if (d.categorySales.length > 0) {
      catSheet.addChart({
        type: 'bar',
        title: 'Ventas por Categoria',
        series: [{ name: 'Total', values: 'Categorias!C2:C' + (d.categorySales.length + 1), categories: 'Categorias!A2:A' + (d.categorySales.length + 1) }],
        from: { col: 6, row: 1 },
        to: { col: 16, row: 14 },
        legend: false,
        varyColors: true,
      });
    }

    
    const hourSheet = addSheet('Horario', ['Hora', 'Transacciones', 'Total'],
      d.hourlySales.map(h => [h.rangeLabel, h.transactionCount, h.totalAmount]));
    if (d.hourlySales.length > 0) {
      hourSheet.addChart({
        type: 'line',
        title: 'Transacciones por Hora',
        series: [
          { name: 'Transacciones', values: 'Horario!B2:B' + (d.hourlySales.length + 1), categories: 'Horario!A2:A' + (d.hourlySales.length + 1) },
          { name: 'Total (S/)', values: 'Horario!C2:C' + (d.hourlySales.length + 1) },
        ],
        from: { col: 5, row: 1 },
        to: { col: 15, row: 14 },
        legend: true,
      });
    }

    
    addSheet('Top Productos', ['#', 'Producto', 'Categoria', 'Cantidad', 'Total', '%'],
      d.topProducts.map(p => [p.rank, p.productName, p.categoryName, p.totalQuantity, p.totalAmount, this.getProductPct(p.totalAmount, d.topProducts)]));

    
    if (d.bottomProducts && d.bottomProducts.length > 0) {
      addSheet('Menos Vendidos', ['#', 'Producto', 'Categoria', 'Cantidad', 'Total'],
        d.bottomProducts.map((p: any, i: number) => [i + 1, p.productName, p.categoryName, p.totalQuantity, p.totalAmount]));
    }

    
    const turnSheet = addSheet('Turnos', ['Turno', 'Transacciones', 'Total'],
      d.turnSales.map(t => [t.turnName, t.transactionCount, t.totalAmount]));
    if (d.turnSales.length > 0) {
      turnSheet.addChart({
        type: 'column',
        title: 'Facturacion por Turno',
        series: [
          { name: 'Total (S/)', values: 'Turnos!C2:C' + (d.turnSales.length + 1), categories: 'Turnos!A2:A' + (d.turnSales.length + 1) },
        ],
        from: { col: 5, row: 1 },
        to: { col: 12, row: 12 },
        legend: false,
        varyColors: true,
      });
    }

    
    const paySheet = addSheet('Metodo Pago', ['Metodo', 'Transacciones', 'Total', '%'],
      d.paymentMethodBreakdown.map(p => [p.method, p.count, p.total, p.percentage]));
    if (d.paymentMethodBreakdown.length > 0) {
      paySheet.addChart({
        type: 'doughnut',
        title: 'Proporcion de Metodos de Pago',
        series: [{ name: 'Transacciones', values: 'Metodo Pago!B2:B' + (d.paymentMethodBreakdown.length + 1), categories: 'Metodo Pago!A2:A' + (d.paymentMethodBreakdown.length + 1) }],
        from: { col: 6, row: 1 },
        to: { col: 16, row: 14 },
        legend: true,
        dataLabels: { showPercent: true },
      });
    }

    
    if (d.discounts && d.discounts.length > 0) {
      addSheet('Descuentos', ['Venta', 'Colaborador', 'Subtotal', 'Descuento', 'Total', 'Metodo', 'Fecha'],
        d.discounts.map((disc: any) => [disc.saleId, disc.colaborador, disc.subtotal, disc.discountAmount, disc.total, disc.paymentMethod, disc.issueDate ? new Date(disc.issueDate).toLocaleDateString() : '']));
    }

    
    const uint8 = await wb.build();
    const blob = new Blob([uint8 as unknown as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_analitico_' + this.startDate + '_al_' + this.endDate + '.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }

  
  exportPDF() {
    const d = this.data();
    if (!d) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = 190;
    const pageH = 280;
    let y = 15;
    const lineH = 9;
    const margin = 10;

    const checkPage = () => {
      if (y > pageH) {
        doc.addPage();
        y = 15;
      }
    };

    const addTitle = (text: string) => {
      checkPage();
      doc.setFontSize(13); doc.setTextColor(80, 50, 50); doc.text(text, margin, y); y += 7;
    };
    const addRow = (label: string, value: string) => {
      checkPage();
      doc.setFontSize(9); doc.setTextColor(60, 60, 60);
      doc.text(label, margin + 5, y); doc.text(value, pageW, y, { align: 'right' }); y += lineH;
    };
    const addCols = (cols: string[], widths: number[]) => {
      checkPage();
      doc.setFontSize(8); doc.setTextColor(60, 60, 60);
      let x = margin + 5;
      cols.forEach((c, i) => {
        doc.text(c, x, y, { align: i === 0 ? 'left' : 'right' });
        x += widths[i] || 40;
      });
      y += lineH;
    };
    const separator = () => {
      checkPage(); y += 1;
      doc.setDrawColor(210, 210, 210); doc.line(margin, y, pageW, y); y += 3;
    };

    
    doc.setFontSize(20); doc.setTextColor(80, 50, 50); doc.text('Esoterica POS', margin, y); y += 7;
    doc.setFontSize(10); doc.setTextColor(120, 120, 120);
    doc.text('Reporte Analitico del Negocio', margin, y); y += 5;
    doc.text(this.startDate + ' al ' + this.endDate, margin, y); y += 8;

    
    addTitle('1. Resumen General');
    addRow('Total Transacciones:', String(d.totalTransactions));
    addRow('Total Ventas:', 'S/ ' + d.totalSalesAmount.toFixed(2));
    addRow('Ticket Promedio:', 'S/ ' + d.averageTicket.toFixed(2));

    
    if (d.categorySales.length > 0) {
      separator();
      addTitle('2. Ventas por Categoria');
      d.categorySales.forEach(c => addRow(c.categoryName, 'S/ ' + c.totalAmount.toFixed(2) + ' (' + c.totalQuantity + ' uds, ' + c.percentage + '%)'));
    }

    
    if (d.hourlySales.length > 0) {
      separator();
      addTitle('3. Analisis por Horario');
      d.hourlySales.forEach(h => addRow(h.rangeLabel, 'S/ ' + h.totalAmount.toFixed(2) + ' (' + h.transactionCount + ' tx)'));
    }

    
    if (d.topProducts.length > 0) {
      separator();
      addTitle('4. Top Productos');
      const w4 = [10, 55, 30, 40, 40];
      addCols(['#', 'Producto', 'Cat.', 'Cantidad', 'Total'], w4);
      doc.setDrawColor(200, 200, 200); doc.line(margin + 5, y - 2, pageW, y - 2); y += 1;
      d.topProducts.forEach(p => {
        checkPage();
        doc.setFontSize(8); doc.setTextColor(40, 40, 40);
        let x = margin + 5;
        doc.text(String(p.rank), x, y); x += w4[0];
        doc.text(p.productName.substring(0, 22), x, y); x += w4[1];
        doc.text(p.categoryName.substring(0, 10), x, y, { align: 'right' }); x += w4[2];
        doc.text(String(p.totalQuantity), x, y, { align: 'right' }); x += w4[3];
        doc.text('S/ ' + p.totalAmount.toFixed(2), x, y, { align: 'right' });
        y += lineH - 1;
      });
    }

    
    if (d.turnSales.length > 0) {
      separator();
      addTitle('5. Ventas por Turno');
      d.turnSales.forEach(t => addRow(t.turnName, 'S/ ' + t.totalAmount.toFixed(2) + ' (' + t.transactionCount + ' tx)'));
    }

    
    if (d.paymentMethodBreakdown.length > 0) {
      separator();
      addTitle('6. Metodos de Pago');
      d.paymentMethodBreakdown.forEach(p => addRow(p.method, 'S/ ' + p.total.toFixed(2) + ' (' + p.count + ' tx, ' + p.percentage + '%)'));
    }

    
    if (d.discounts && d.discounts.length > 0) {
      separator();
      addTitle('7. Descuentos Aplicados');
      addRow('Total ventas con desc.', String(d.discounts.length));
      const totalDisc = this.getTotalDiscounts(d.discounts);
      addRow('Monto total descontado:', 'S/ ' + totalDisc.toFixed(2));

      separator();
      addTitle('Detalle de Descuentos');
      const w7 = [15, 30, 35, 35, 35, 25];
      addCols(['Venta', 'Colaborador', 'Subtotal', 'Descuento', 'Total', 'Pago'], w7);
      doc.setDrawColor(200, 200, 200); doc.line(margin + 5, y - 2, pageW, y - 2);
      d.discounts.forEach((disc: any) => {
        checkPage();
        doc.setFontSize(7.5); doc.setTextColor(40, 40, 40);
        let x = margin + 5;
        doc.text('#' + String(disc.saleId), x, y); x += w7[0];
        doc.text((disc.colaborador || '').substring(0, 12), x, y); x += w7[1];
        doc.text('S/ ' + disc.subtotal.toFixed(2), x, y, { align: 'right' }); x += w7[2];
        doc.text('S/ ' + disc.discountAmount.toFixed(2), x, y, { align: 'right' }); x += w7[3];
        doc.text('S/ ' + disc.total.toFixed(2), x, y, { align: 'right' }); x += w7[4];
        doc.text(disc.paymentMethod || '', x, y, { align: 'right' });
        y += lineH - 1;
      });
    }

    doc.save('reporte_analitico_' + this.startDate + '_al_' + this.endDate + '.pdf');
  }
}