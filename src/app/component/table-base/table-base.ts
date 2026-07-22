import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  OnChanges,
  SimpleChanges,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';





export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

export interface TableAction {
  label: string;
  action: string;
  class?: string; 
}

export interface TablePageEvent {
  page: number;
  pageSize: number;
}





@Component({
  selector: 'app-table-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-base.html',
  styleUrl: './table-base.css',
})
export class TableBaseComponent<T = any> implements OnChanges {
  
  @Input() data: T[] = [];

  
  @Input() columns: TableColumn[] = [];

  
  @Input() title = '';

  
  @Input() loading = false;

  
  @Input() pageSize = 10;

  
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  
  @Input() emptyMessage = 'No hay datos';

  
  @Input() filteredMessage = 'Ningún elemento coincide con los filtros';

  
  @Input() trackByKey = 'id';

  
  @Output() pageChange = new EventEmitter<TablePageEvent>();

  
  @ContentChild('rowTemplate')
  rowTemplate?: TemplateRef<any>;

  
  currentPage = 1;
  totalPages = 1;
  paginatedData: T[] = [];
  pageInfo = { start: 0, end: 0, total: 0 };

  
  
  

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pageSize']) {
      this.updatePagination();
    }
  }

  
  
  

  private updatePagination(): void {
    const total = this.data.length;
    this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedData = this.data.slice(start, start + this.pageSize);

    this.pageInfo = {
      start: total === 0 ? 0 : start + 1,
      end: Math.min(this.currentPage * this.pageSize, total),
      total,
    };
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePagination();
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  
  getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, current + 1);

      if (current <= 2) { start = 2; end = 3; }
      if (current >= total - 1) { start = total - 2; end = total - 1; }

      if (start > 2) pages.push(-1); 
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 1) pages.push(-2); 
      pages.push(total);
    }

    return pages;
  }

  
  
  

  
  getValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  trackByIndex(index: number): number {
    return index;
  }
}