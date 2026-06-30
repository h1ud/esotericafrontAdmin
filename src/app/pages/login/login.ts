import { Component, ChangeDetectorRef } from '@angular/core'; // 👈 1. IMPORTAR ChangeDetectorRef
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/Auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef, // 👈 2. INYECTAR EN EL CONSTRUCTOR
  ) {}

  onLogin() {
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.router.navigate(['/admin/clients']);
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
        console.error('Login error:', err);

        // 👈 3. FORZAR LA DETECCIÓN DE CAMBIOS AQUÍ
        // Esto obliga a Angular a pintar el "errorMessage" en el HTML de golpe
        this.cdr.detectChanges();
      },
    });
  }
}
