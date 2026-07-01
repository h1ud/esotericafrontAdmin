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
  // <-- Tu clase se llama exactamente como querías
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Usamos el tipo de la interfaz del servicio para el formulario
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

    // Convertimos los datos al tipo de la interfaz antes de enviarlos
    const requestToSave = { ...this.formData } as PasswordResetData;

    this.resetService.createRequest(requestToSave).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Solicitud de recuperación enviada con éxito.';
        this.formData = { name: '', lastName: '', username: '', email: '' }; // Limpiar formulario
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
