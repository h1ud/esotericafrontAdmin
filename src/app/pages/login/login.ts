import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../service/Auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html', // Asegúrate de enlazar a tu HTML
  styleUrl: './login.css',
})
export class Login {
  // Enlazamos las variables con el [(ngModel)] del HTML
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin() {
    this.errorMessage = ''; // Limpiamos errores previos

    this.authService.login(this.loginData).subscribe({
      next: () => {
        // Éxito: Redirigir al panel de clientes
        this.router.navigate(['/admin/clients']);
      },
      error: (err) => {
        // Error: Mostrar mensaje
        this.errorMessage = 'Usuario o contraseña incorrectos';
        console.error('Login error:', err);
      },
    });
  }
}
