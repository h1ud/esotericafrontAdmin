import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordResetService, PasswordResetData } from '../../service/password-reset';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.css',
})
export class PasswordReset {
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  formData: Partial<PasswordResetData> = {
    name: '',
    lastName: '',
    username: '',
    email: '',
  };

  constructor(
    private resetService: PasswordResetService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  saveRequest(): void {
    if (
      !this.formData.name ||
      !this.formData.lastName ||
      !this.formData.username ||
      !this.formData.email
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const requestToSave = { ...this.formData } as PasswordResetData;

    this.resetService.createRequest(requestToSave).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Solicitud de recuperación enviada con éxito.';
        this.formData = { name: '', lastName: '', username: '', email: '' };
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'Error al enviar la solicitud.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
