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
  showCashPrompt: boolean = false;
  isLoggingIn: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onLogin() {
    this.errorMessage = '';
    this.isLoggingIn = true;

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoggingIn = false;
        const roles = this.authService.getRoles();

        if (roles.includes('ADMIN')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('COLABORADOR') || roles.includes('BACKOFFICE')) {
          this.showCashPrompt = true;
          this.cdr.detectChanges();
        } else {
          this.router.navigate(['/pos-home']);
        }
      },
      error: (err) => {
        this.isLoggingIn = false;
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.cdr.detectChanges();
      },
    });
  }

  acceptCashOpen(): void {
    this.showCashPrompt = false;
    this.cdr.detectChanges();
    this.router.navigate(['/pos-home']);
  }

  rejectCashOpen(): void {
    this.showCashPrompt = false;
    this.authService.logout();
    this.cdr.detectChanges();
  }
}
