import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/Auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginData = { username: '', password: '' };
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onLogin() {
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        const roles = this.authService.getRoles();
        console.log('AHORA SÍ LLEGAN:', roles); // Debería salir: ["ADMIN"]

        if (roles.includes('ADMIN')) {
          // Si es ADMIN, directo a su panel
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('COLABORADOR') || roles.includes('BACKOFFICE')) {
          // Si es trabajador, directo al POS
          this.router.navigate(['/pos-home']);
        } else {
          this.router.navigate(['/pos-home']);
        }
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.cdr.detectChanges();
      },
    });
  }
}
