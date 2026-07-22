import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../service/report.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class Reports {
  reportType = signal<string>('sales');
  startDate: string = '';
  endDate: string = '';

  reportData = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private reportService: ReportService) {}

  onReportTypeChange(newType: string) {
    this.reportType.set(newType);
    this.reportData.set([]);
    this.errorMessage.set('');
  }

  
  colspanActual(): number {
    switch (this.reportType()) {
      case 'sales': return 7;
      case 'products': return 5;
      case 'cash': return 7;
      default: return 1;
    }
  }

  cargarReporte() {
    this.errorMessage.set('');

    if (!this.startDate || !this.endDate) {
      this.errorMessage.set('Por favor selecciona ambas fechas.');
      return;
    }
    if (this.startDate > this.endDate) {
      this.errorMessage.set('La fecha de inicio no puede ser mayor que la fecha fin.');
      return;
    }

    this.isLoading.set(true);
    this.reportData.set([]);

    this.reportService
      .obtenerReporte(this.reportType(), this.startDate, this.endDate)
      .subscribe({
        next: (data) => {
          this.reportData.set(data);
          this.isLoading.set(false);
          if (data.length === 0) {
            this.errorMessage.set('No hay registros en el rango de fechas seleccionado.');
          }
        },
        error: (err) => {
          console.error('❌ Error:', err);
          this.isLoading.set(false);
          if (err.status === 401) {
            this.errorMessage.set('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          } else if (err.status === 403) {
            this.errorMessage.set('No tienes permisos para acceder a este reporte.');
          } else {
            this.errorMessage.set('Error al obtener el reporte. Verifica tu conexión.');
          }
        },
      });
  }

  exportarExcel() {
    const data = this.reportData();
    if (data.length === 0) {
      this.errorMessage.set('No hay datos para exportar.');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    let dataForExcel: any[];
    let sheetName: string;
    let fileName: string;

    if (this.reportType() === 'sales') {
      dataForExcel = data.map((item) => ({
        'Fecha y Hora': new Date(item.issueDate).toLocaleString('es-PE'),
        Colaborador: item.colaborador,
        'Método de Pago': item.paymentMethod,
        Estado: item.paymentStatus,
        'Subtotal (S/.)': item.subtotal?.toFixed(2) || '0.00',
        'Descuento (S/.)': item.discountAmount?.toFixed(2) || '0.00',
        'Total (S/.)': item.total?.toFixed(2) || '0.00',
      }));
      sheetName = 'Reporte de Ventas';
      fileName = `reporte_ventas_${this.startDate}_al_${this.endDate}.xlsx`;

    } else if (this.reportType() === 'products') {
      dataForExcel = data.map((item) => ({
        Producto: item.productName,
        Descripción: item.description,
        Categoría: item.categoryName,
        'Precio (S/.)': item.price?.toFixed(2) || '0.00',
        Disponibilidad: item.availabilityStatus,
      }));
      sheetName = 'Reporte de Productos';
      fileName = `reporte_productos_${this.startDate}_al_${this.endDate}.xlsx`;

    } else if (this.reportType() === 'cash') {
      dataForExcel = data.map((item) => ({
        'Fecha y Hora': new Date(item.emissionDate).toLocaleString('es-PE'),
        Colaborador: item.colaborador,
        'Efectivo (S/.)': item.totalEfectivo?.toFixed(2) || '0.00',
        'Yape/Plin (S/.)': item.totalYapePlin?.toFixed(2) || '0.00',
        'Tarjeta (S/.)': item.totalTarjeta?.toFixed(2) || '0.00',
        'Total (S/.)': item.total?.toFixed(2) || '0.00',
        Notas: item.notes || '',
      }));
      sheetName = 'Reporte de Cierre de Caja';
      fileName = `reporte_cierre_caja_${this.startDate}_al_${this.endDate}.xlsx`;

    } else {
      this.errorMessage.set('Tipo de reporte no válido para exportar.');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  }
}