import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { SaleListService, DashboardData } from '../../service/sale-list.service';

interface Kpi {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  iconPath: string;
}

interface BarPoint { label: string; value: number; }

interface ActivityItem {
  title: string;
  meta: string;
  iconPath: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly currentDate = signal(new Date());
  readonly loading = signal(true);
  readonly error = signal('');

  // Real data from API
  readonly kpis = signal<Kpi[]>([]);
  readonly salesByDay = signal<BarPoint[]>([]);
  readonly recentActivity = signal<ActivityItem[]>([]);

  // Payment breakdown
  readonly paymentBreakdown = signal<{ method: string; count: number; total: number }[]>([]);
  readonly monthData = signal<DashboardData['month'] | null>(null);
  readonly todayData = signal<DashboardData['today'] | null>(null);

  // Saludo dinámico
  readonly greeting = computed(() => {
    const h = this.currentDate().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  readonly formattedDate = computed(() =>
    this.currentDate().toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  readonly maxBar = computed(() =>
    Math.max(...this.salesByDay().map(p => p.value), 1),
  );

  readonly monthEfectivoPct = computed(() => {
    const m = this.monthData();
    if (!m || m.totalAmount === 0) return 0;
    return (m.efectivoAmount / m.totalAmount) * 100;
  });

  readonly monthYapePct = computed(() => {
    const m = this.monthData();
    if (!m || m.totalAmount === 0) return 0;
    return (m.yapePlinAmount / m.totalAmount) * 100;
  });

  readonly dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  constructor(
    private saleListService: SaleListService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.saleListService.getDashboard().subscribe({
      next: (data) => {
        this.buildDashboard(data);
        this.loading.set(false);
        this.cdr.detectChanges();
        setTimeout(() => this.runAnimations(), 50);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas. Verifique la conexión con el servidor.');
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  private buildDashboard(data: DashboardData): void {
    this.todayData.set(data.today);
    this.monthData.set(data.month);

    // KPIs
    this.kpis.set([
      {
        label: 'Ventas hoy',
        value: data.today.totalAmount,
        prefix: 'S/ ',
        iconPath: 'M3 3v18h18M7 14l4-4 4 4 5-5',
      },
      {
        label: 'Transacciones hoy',
        value: data.today.transactionCount,
        iconPath: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6',
      },
      {
        label: 'Productos activos',
        value: data.totalProducts,
        iconPath: 'M3 7h18l-2 13H5L3 7zM8 7V5a4 4 0 0 1 8 0v2',
      },
      {
        label: 'Clientes registrados',
        value: data.totalClients,
        iconPath: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0',
      },
    ]);

    // Weekly sales
    this.salesByDay.set(
      data.weekSales.map(d => ({
        label: this.dayNames[new Date(d.date).getDay()],
        value: d.total,
      })),
    );

    // Payment breakdown
    this.paymentBreakdown.set(data.paymentBreakdown);

    // Recent activity
    this.recentActivity.set(
      data.recentActivity.slice(0, 6).map(a => ({
        title: a.title,
        meta: a.meta,
        iconPath: 'M5 13l4 4L19 7',
      })),
    );
  }

  goToSales(): void {
    this.router.navigate(['/admin/sales']);
  }

  // ============================================================
  // Animaciones GSAP
  // ============================================================
  @ViewChildren('kpiCard') kpiCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('kpiNumber') kpiNumbers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('barFill') barFills!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('activityItem') activityItems!: QueryList<ElementRef<HTMLElement>>;

  private runAnimations(): void {
    // 1) KPI cards entrance
    const cards = this.kpiCards?.map(c => c.nativeElement) || [];
    if (cards.length) {
      gsap.from(cards, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
      });
    }

    // 2) Count-up on KPIs
    this.kpiNumbers?.forEach((ref, i) => {
      const kpi = this.kpis()[i];
      if (!kpi) return;
      const target = kpi.value;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.4,
        delay: 0.3 + i * 0.08,
        ease: 'power2.out',
        onUpdate: () => {
          const formatted = Math.round(obj.v).toLocaleString('es-PE');
          ref.nativeElement.textContent = `${kpi.prefix ?? ''}${formatted}${kpi.suffix ?? ''}`;
        },
      });
    });

    // 3) Bar grow
    this.barFills?.forEach((ref, i) => {
      const point = this.salesByDay()[i];
      if (!point) return;
      const target = (point.value / this.maxBar()) * 100;
      gsap.fromTo(
        ref.nativeElement,
        { height: '0%' },
        { height: `${target}%`, duration: 1, delay: 0.5 + i * 0.06, ease: 'power3.out' },
      );
    });

    // 4) Activity items stagger
    const items = this.activityItems?.map(i => i.nativeElement) || [];
    if (items.length) {
      gsap.from(items, {
        x: -20,
        opacity: 0,
        duration: 0.5,
        delay: 0.9,
        ease: 'power2.out',
        stagger: 0.08,
      });
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
