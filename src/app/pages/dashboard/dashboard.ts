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
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

interface Kpi {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: number;          // % de cambio
  iconPath: string;       // SVG path d
}

interface BarPoint { label: string; value: number; }

interface ActivityItem {
  title: string;
  meta: string;
  amount?: string;
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

  // ============================================================
  // Estado reactivo con signals
  // ============================================================
  readonly userName    = signal('María');
  readonly currentDate = signal(new Date());

  readonly kpis = signal<Kpi[]>([
    {
      label: 'Clientes activos',
      value: 1248,
      trend: 12.4,
      iconPath: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0',
    },
    {
      label: 'Productos en menú',
      value: 86,
      trend: 4.1,
      iconPath: 'M3 7h18l-2 13H5L3 7zM8 7V5a4 4 0 0 1 8 0v2',
    },
    {
      label: 'Ventas del mes',
      value: 18420,
      prefix: 'S/ ',
      trend: 8.7,
      iconPath: 'M3 3v18h18M7 14l4-4 4 4 5-5',
    },
    {
      label: 'Promociones activas',
      value: 14,
      trend: -2.3,
      iconPath: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM9 12l2 2 4-4',
    },
  ]);

  readonly salesByDay = signal<BarPoint[]>([
    { label: 'Lun', value: 32 },
    { label: 'Mar', value: 48 },
    { label: 'Mié', value: 41 },
    { label: 'Jue', value: 67 },
    { label: 'Vie', value: 84 },
    { label: 'Sáb', value: 96 },
    { label: 'Dom', value: 72 },
  ]);

  // Línea acumulativa mock
  readonly linePoints = signal<number[]>([12, 28, 22, 48, 56, 64, 58, 72, 88, 82, 95, 110]);

  readonly recentActivity = signal<ActivityItem[]>([
    { title: 'Nuevo cliente registrado', meta: 'Hace 5 min · Lucía R.', iconPath: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21a8 8 0 0 1 16 0' },
    { title: 'Pedido #1042 completado',  meta: 'Hace 22 min · S/ 184.50', iconPath: 'M5 13l4 4L19 7' },
    { title: 'Promoción “Dulce Otoño”',  meta: 'Hace 1 h · Creada por admin', iconPath: 'M12 8v8m-4-4h8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
    { title: 'Producto actualizado',      meta: 'Hace 3 h · Tarta de chocolate', iconPath: 'M4 4h16v4H4zM4 12h10v4H4zM4 20h7', amount: 'Stock +20' },
  ]);

  // Saludo dinámico según la hora
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

  // ============================================================
  // Máximo de las barras (para escalar SVG)
  // ============================================================
  readonly maxBar = computed(() =>
    Math.max(...this.salesByDay().map(p => p.value)),
  );

  // Puntos del polyline (normalizados al viewBox 0 0 600 200)
  // Devuelve [{x,y}] normalizado al viewBox 0 0 600 200
  readonly lineCoords = computed(() => {
    const pts = this.linePoints();
    const max = Math.max(...pts);
    const min = Math.min(...pts);
    const range = max - min || 1;
    const stepX = 600 / (pts.length - 1);
    return pts.map((v, i) => ({
      x: +i * stepX,
      y: 200 - ((v - min) / range) * 180 - 10,
    }));
  });

  readonly polylinePoints = computed(() =>
    this.lineCoords().map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
  );

  readonly linePathD = computed(() => {
    const c = this.lineCoords();
    if (!c.length) return '';
    return c
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
  });

  readonly lastPoint = computed(() => {
    const c = this.lineCoords();
    return c.length ? c[c.length - 1] : { x: 0, y: 0 };
  });

  // ============================================================
  // Animaciones GSAP
  // ============================================================
  @ViewChildren('kpiCard') kpiCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('kpiNumber') kpiNumbers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('barFill') barFills!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('activityItem') activityItems!: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('linePath') linePathRef!: QueryList<ElementRef<SVGPathElement>>;
  @ViewChildren('lineDot')  lineDotRef!:  QueryList<ElementRef<SVGCircleElement>>;

  private linePath?: SVGPathElement;
  private lineDot?: SVGCircleElement;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Esperar al siguiente tick para que los ViewChildren estén disponibles
    setTimeout(() => this.runAnimations(), 0);
  }

  private runAnimations(): void {
    // Capturar referencias SVG desde la QueryList
    const lp = this.linePathRef?.first?.nativeElement;
    const ld = this.lineDotRef?.first?.nativeElement;
    if (lp) this.linePath = lp;
    if (ld) this.lineDot  = ld;

    // 1) Entrada escalonada de las KPI cards
    const cards = this.kpiCards.map(c => c.nativeElement);
    if (cards.length) {
      gsap.from(cards, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
      });
    }

    // 2) Count-up numérico en cada KPI
    this.kpiNumbers.forEach((ref, i) => {
      const target = this.kpis()[i]?.value ?? 0;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.4,
        delay: 0.3 + i * 0.08,
        ease: 'power2.out',
        onUpdate: () => {
          const kpi = this.kpis()[i];
          if (!kpi) return;
          const formatted = Math.round(obj.v).toLocaleString('es-PE');
          ref.nativeElement.textContent = `${kpi.prefix ?? ''}${formatted}${kpi.suffix ?? ''}`;
        },
      });
    });

    // 3) Bar grow del gráfico de barras
    this.barFills.forEach((ref, i) => {
      const point = this.salesByDay()[i];
      if (!point) return;
      const target = (point.value / this.maxBar()) * 100;
      gsap.fromTo(
        ref.nativeElement,
        { height: '0%' },
        { height: `${target}%`, duration: 1, delay: 0.5 + i * 0.06, ease: 'power3.out' },
      );
    });

    // 4) Line draw del gráfico de líneas
    if (this.linePath) {
      const length = this.linePath.getTotalLength();
      gsap.set(this.linePath, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(this.linePath, {
        strokeDashoffset: 0,
        duration: 1.6,
        delay: 0.6,
        ease: 'power2.inOut',
      });
    }
    if (this.lineDot) {
      gsap.fromTo(
        this.lineDot,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 2.1, ease: 'back.out(2)' },
      );
    }

    // 5) Stagger en actividad reciente
    const items = this.activityItems.map(i => i.nativeElement);
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

}
