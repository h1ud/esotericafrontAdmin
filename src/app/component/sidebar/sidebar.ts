import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../service/Auth/auth.service';
import gsap from 'gsap';

interface NavItem {
  label: string;
  path: string;
  iconPath: string;     // SVG path d
  isLogout?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Estado del usuario (mock - reemplaza con tu servicio)
  readonly user = signal({
    name: 'María González',
    role: 'Administradora',
    initials: 'MG',
  });

  // Lista de navegación
  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard',    path: '/admin/dashboard',         iconPath: 'M3 12 12 3l9 9M5 10v10h14V10' },
    { label: 'Clientes',     path: '/admin/clients',           iconPath: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0' },
    { label: 'Empleados',    path: '/admin/employees',         iconPath: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M20 8v6M23 11h-6' },
    { label: 'Menú',         path: '/admin/menu',              iconPath: 'M3 7h18l-2 13H5L3 7zM8 7V5a4 4 0 0 1 8 0v2' },
    { label: 'Códigos',      path: '/admin/codes',             iconPath: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' },
    { label: 'Reportes',     path: '/admin/reports',           iconPath: 'M3 3v18h18M7 16l4-4 4 4 6-6' },
    { label: 'Reseteos',     path: '/admin/password-reset-list', iconPath: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 8v4M12 16h.01' },
  ]);

  // El indicador de item activo
  @ViewChildren('navLink') navLinks!: QueryList<ElementRef<HTMLAnchorElement>>;
  private indicator: HTMLElement | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.runAnimations(), 0);
  }

  private runAnimations(): void {
    // Capturar indicador desde el DOM
    this.indicator = this.host.nativeElement.querySelector('.nav-indicator');

    const links = this.navLinks.map(l => l.nativeElement);
    if (!links.length) return;

    // 1) Entrada escalonada de los items
    gsap.from(links, {
      x: -16,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.06,
      delay: 0.1,
    });

    // 2) Avatar del usuario aparece desde abajo
    const avatar = this.host.nativeElement.querySelector('.sidebar-footer');
    if (avatar) {
      gsap.from(avatar, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: 'power2.out',
      });
    }

    // 3) Logo: entrada + pulse sutil
    const logo = this.host.nativeElement.querySelector('.sidebar-brand');
    if (logo) {
      gsap.from(logo, {
        opacity: 0,
        y: -10,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(logo, {
            scale: 1.02,
            duration: 1.4,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          });
        },
      });
    }

    // 4) Posicionar el indicador de item activo inicial
    this.positionIndicator();
  }

  /** Mueve el indicador al item activo cuando cambia la ruta */
  onActiveChange(): void {
    // Esperar al siguiente tick: routerLinkActive aplica la clase después del click
    setTimeout(() => this.positionIndicator(), 0);
  }

  private positionIndicator(): void {
    if (!this.indicator) return;
    const active = this.navLinks
      .map(l => l.nativeElement)
      .find(a => a.classList.contains('is-active'));
    if (!active) {
      gsap.to(this.indicator, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      return;
    }
    const linkRect = active.getBoundingClientRect();
    const list = active.closest('.nav-list');
    if (!list) return;
    const parentRect = list.getBoundingClientRect();
    const targetY = linkRect.top - parentRect.top + (linkRect.height - 36) / 2;

    gsap.to(this.indicator, {
      y: targetY,
      opacity: 1,
      duration: 0.5,
      ease: 'power3.out',
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
