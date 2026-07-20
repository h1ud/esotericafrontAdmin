import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordResetService, PasswordResetData } from '../../service/password-reset';

@Component({
  selector: 'app-password-reset-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-reset-list.html',
  styleUrl: './password-reset-list.css',
})
export class PasswordResetList implements OnInit {
  requests: PasswordResetData[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  searchTerm: string = '';

  constructor(
    private resetService: PasswordResetService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.resetService.listRequests().subscribe({
      next: (data: PasswordResetData[]) => {
        this.requests = data;
        this.loading = false;
        this.cdr.detectChanges(); // Asegura el renderizado en standalone
      },
      error: (err: any) => {
        this.errorMessage = 'Error al cargar las solicitudes de soporte.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Filtrado rápido por usuario o email igual que implementaste en clientes
  filteredRequests(): PasswordResetData[] {
    if (!this.searchTerm.trim()) {
      return this.requests;
    }
    const term = this.searchTerm.toLowerCase();
    return this.requests.filter(
      (req) => req.username.toLowerCase().includes(term) || req.email.toLowerCase().includes(term),
    );
  }
}
