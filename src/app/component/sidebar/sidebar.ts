import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/Auth/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogout(): void {
    this.authService.logout(); // Borra el token del localStorage
    this.router.navigate(['/login']); // Lo redirige al login de inmediato
  }
}
