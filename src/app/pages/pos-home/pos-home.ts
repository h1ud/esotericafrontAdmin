import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PosMenuService, CategoryDTO, ProductDTO } from '../../service/pos-menu.service';
import { SaleService } from '../../service/sale.service';
import { SaleListService, SaleResponse } from '../../service/sale-list.service';
import { AuthService } from '../../service/Auth/auth.service';
import {
  CashRegisterService,
  CashStatus,
  CashCloseSummary,
} from '../../service/cash-register.service';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

export type PaymentMethod = 'efectivo' | 'yape_plin';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ReceiptData {
  saleId: number;
  total: number;
  paymentMethod: string;
  issueDate: string;
  items: { name: string; qty: number; price: number }[];
}

@Component({
  selector: 'app-pos-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-home.html',
  styleUrls: ['./pos-home.css'],
})
export class PosHome implements OnInit {
  categories: CategoryDTO[] = [];
  products: ProductDTO[] = [];
  cart: CartItem[] = [];
  filteredProducts: ProductDTO[] = [];
  searchQuery: string = '';

  selectedCategoryId: number | null = null;
  loading: boolean = false;
  errorMessage: string = '';

  /** Category grid navigation */
  showCategoryGrid: boolean = true;
  selectedCategory: CategoryDTO | null = null;

  /** Cash register */
  cashStatus: CashStatus = {
    isOpen: false,
    cashOpeningId: null,
    openedBy: null,
    openedByName: null,
    openedAt: null,
    initialAmount: 0,
    totalEfectivo: 0,
    totalYapePlin: 0,
    totalSales: 0,
    transactionCount: 0,
  };
  showOpenCashModal: boolean = false;
  cashInitialAmount: number = 0;
  showCloseCashModal: boolean = false;
  cashCloseNotes: string = '';
  cashCloseSummary: CashCloseSummary | null = null;
  showCashSummary: boolean = false;
  cashLoading: boolean = false;

    /** Saved cart for later */
  savedCarts: { name: string; items: CartItem[] }[] = [];
  showSaveCartModal: boolean = false;
  savedCartName: string = '';
  showLoadCartModal: boolean = false;

  /** Checkout */
  isCheckout: boolean = false;
  paymentMethod: PaymentMethod = 'efectivo';
  amountPaid: number = 0;
  yapeConfirmed: boolean = false;
  showReceipt: boolean = false;
  receiptData: ReceiptData | null = null;
  processingPayment: boolean = false;

  /** Recent sales */
  recentSales: SaleResponse[] = [];
  loadingSales: boolean = false;
  showRecentSales: boolean = false;

  /** Toasts */
  private toastSeq = 0;
  toasts: Toast[] = [];

  constructor(
    private posMenuService: PosMenuService,
    private saleService: SaleService,
    private saleListService: SaleListService,
    private cashRegisterService: CashRegisterService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCashStatus();
    this.loadCategories();
    this.loadRecentSales();
  }

  // ============================================================
  // CASH REGISTER
  // ============================================================

  loadCashStatus(): void {
    this.cashLoading = true;
    this.cashRegisterService.getStatus().subscribe({
      next: (status) => {
        this.cashStatus = status;
        this.cashLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cashLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openOpenCashModal(): void {
    this.cashInitialAmount = 0;
    this.showOpenCashModal = true;
    this.cdr.detectChanges();
  }

  cancelOpenCash(): void {
    this.showOpenCashModal = false;
    this.cdr.detectChanges();
  }

  confirmOpenCash(): void {
    if (this.cashInitialAmount <= 0) {
      this.pushToast('error', 'El monto inicial debe ser mayor a cero');
      return;
    }
    this.cashLoading = true;
    this.cashRegisterService.openCashRegister({ initialAmount: this.cashInitialAmount }).subscribe({
      next: (status) => {
        this.cashStatus = status;
        this.showOpenCashModal = false;
        this.pushToast('success', 'Caja abierta correctamente');
        this.cashLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.error || 'Error al abrir la caja';
        this.pushToast('error', msg);
        this.cashLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCloseCashModal(): void {
    this.cashCloseNotes = '';
    this.cashCloseSummary = null;
    this.showCloseCashModal = true;
    // refresh status to get latest totals
    this.loadCashStatus();
    this.cdr.detectChanges();
  }

  cancelCloseCash(): void {
    this.showCloseCashModal = false;
    this.cashCloseSummary = null;
    this.cdr.detectChanges();
  }

  confirmCloseCash(): void {
    this.cashLoading = true;
    this.cashRegisterService.closeCashRegister(this.cashCloseNotes).subscribe({
      next: (summary) => {
        this.cashCloseSummary = summary;
        this.showCloseCashModal = false;
        this.showCashSummary = true;
        this.cashStatus.isOpen = false;
        this.cashLoading = false;
        this.pushToast('success', 'Caja cerrada correctamente. Resumen generado.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.error || 'Error al cerrar la caja';
        this.pushToast('error', msg);
        this.cashLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  dismissCashSummary(): void {
    this.showCashSummary = false;
    this.cashCloseSummary = null;
    this.cdr.detectChanges();
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  logout(): void {
    this.authService.logout();
    this.pushToast('info', 'Cerrando sesion...');
    this.cdr.detectChanges();
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 500);
  }

  // ============================================================
  // CATEGORIES & PRODUCTS
  // ============================================================

  loadCategories(): void {
    this.posMenuService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0].id);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al conectar con el servidor de categorias.';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  selectCategory(id: number): void {
    this.selectedCategoryId = id;
    this.selectedCategory = this.categories.find(c => c.id === id) || null;
    this.showCategoryGrid = false;
    this.searchQuery = '';
    this.loading = true;
    this.errorMessage = '';
    this.posMenuService.getProductsByCategory(id).subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los productos de esta categoria.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      },
    });
  }

  goBackToCategories(): void {
    this.showCategoryGrid = true;
    this.selectedCategory = null;
    this.selectedCategoryId = null;
    this.products = [];
    this.filteredProducts = [];
    this.cdr.detectChanges();
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }
    this.cdr.detectChanges();
  }

  // ============================================================
  // RECENT SALES
  // ============================================================

  loadRecentSales(): void {
    this.loadingSales = true;
    this.saleListService.getRecentSales().subscribe({
      next: (data) => {
        this.recentSales = data;
        this.loadingSales = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.recentSales = [];
        this.loadingSales = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleRecentSales(): void {
    this.showRecentSales = !this.showRecentSales;
    if (this.showRecentSales) {
      this.loadRecentSales();
    }
    this.cdr.detectChanges();
  }

  formatDate(iso?: string | null): string {
    if (!iso) return '--';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ============================================================
  // CART
  // ============================================================

  addToCart(product: ProductDTO): void {
    const existingItem = this.cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.cdr.detectChanges();
  }

  incrementQuantity(item: CartItem): void {
    item.quantity++;
    this.cdr.detectChanges();
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeFromCart(item);
    }
    this.cdr.detectChanges();
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter((i) => i.product.id !== item.product.id);
    this.cdr.detectChanges();
  }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  getItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ============================================================
  // SAVE / LOAD CART
  // ============================================================

  openSaveCartModal(): void {
    this.savedCartName = '';
    this.showSaveCartModal = true;
    this.cdr.detectChanges();
  }

  cancelSaveCart(): void {
    this.showSaveCartModal = false;
    this.cdr.detectChanges();
  }

  confirmSaveCart(): void {
    const name = this.savedCartName.trim() || 'Carrito ' + (this.savedCarts.length + 1);
    this.savedCarts = [...this.savedCarts, {
      name,
      items: this.cart.map(item => ({ ...item, product: { ...item.product } })),
    }];
    this.showSaveCartModal = false;
    this.clearCart();
    this.pushToast('success', 'Carrito guardado como: ' + name);
    this.cdr.detectChanges();
  }

  openLoadCartModal(): void {
    this.showLoadCartModal = true;
    this.cdr.detectChanges();
  }

  cancelLoadCart(): void {
    this.showLoadCartModal = false;
    this.cdr.detectChanges();
  }

  loadCart(cart: { name: string; items: CartItem[] }): void {
    if (this.cart.length > 0 && !confirm('El carrito actual se perdera. Desea continuar?')) return;
    this.cart = cart.items.map(item => ({ ...item, product: { ...item.product } }));
    this.showLoadCartModal = false;
    this.pushToast('success', 'Carrito cargado: ' + cart.name);
    this.cdr.detectChanges();
  }

  deleteSavedCart(index: number): void {
    this.savedCarts = this.savedCarts.filter((_, i) => i !== index);
    this.cdr.detectChanges();
  }

  quickSell(product: ProductDTO): void {
    if (!this.cashStatus.isOpen) {
      this.pushToast('error', 'Debe abrir la caja antes de vender');
      return;
    }
    this.cart = [{ product, quantity: 1 }];
    this.cdr.detectChanges();
    this.goToCheckout();
  }

  // ============================================================
  // CHECKOUT
  // ============================================================

  goToCheckout(): void {
    if (this.cart.length === 0) {
      this.pushToast('error', 'El carrito esta vacio');
      return;
    }
    if (!this.cashStatus.isOpen) {
      this.pushToast('error', 'Debe abrir la caja antes de realizar una venta');
      return;
    }
    this.isCheckout = true;
    this.amountPaid = 0;
    this.yapeConfirmed = false;
    this.cdr.detectChanges();
  }

  cancelCheckout(): void {
    this.isCheckout = false;
    this.amountPaid = 0;
    this.yapeConfirmed = false;
    this.cdr.detectChanges();
  }

  getChange(): number {
    const change = this.amountPaid - this.getTotal();
    return change > 0 ? change : 0;
  }

  /** Numeric keypad helpers */
  appendDigit(digit: string): void {
    const current = String(this.amountPaid);
    if (digit === '.') {
      if (!current.includes('.')) {
        this.amountPaid = parseFloat(current + '.') || 0;
      }
    } else {
      const next = current === '0' ? digit : current + digit;
      this.amountPaid = parseFloat(next) || 0;
    }
    this.cdr.detectChanges();
  }

  clearAmount(): void {
    this.amountPaid = 0;
    this.cdr.detectChanges();
  }

  backspaceAmount(): void {
    const current = String(this.amountPaid);
    if (current.length <= 1) {
      this.amountPaid = 0;
    } else {
      this.amountPaid = parseFloat(current.slice(0, -1)) || 0;
    }
    this.cdr.detectChanges();
  }

  confirmPayment(): void {
    if (this.paymentMethod === 'efectivo' && this.amountPaid < this.getTotal()) {
      this.pushToast('error', 'El monto pagado no cubre el total');
      return;
    }
    if (this.paymentMethod === 'yape_plin' && !this.yapeConfirmed) {
      this.pushToast('error', 'Debe confirmar que recibio la transferencia');
      return;
    }

    this.processingPayment = true;

    const saleRequest = {
      paymentMethod: this.paymentMethod,
      items: this.cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.saleService.createSale(saleRequest).subscribe({
      next: (response) => {
        this.processingPayment = false;
        this.receiptData = {
          saleId: response.saleOperationId,
          total: response.totalAmount,
          paymentMethod: this.paymentMethod,
          issueDate: response.issueDate,
          items: this.cart.map((item) => ({
            name: item.product.productName,
            qty: item.quantity,
            price: item.product.price,
          })),
        };
        this.showReceipt = true;
        this.cart = [];
        this.isCheckout = false;
        this.amountPaid = 0;
        this.loadRecentSales();
        this.loadCashStatus(); // refresh totals
        this.pushToast('success', 'Venta #' + response.saleOperationId + ' registrada con exito');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.processingPayment = false;
        console.error('Error al registrar venta:', err);
        this.pushToast('error', 'Error al procesar el pago. Verifique la conexion.');
        this.cdr.detectChanges();
      },
    });
  }

  dismissReceipt(): void {
    this.showReceipt = false;
    this.receiptData = null;
    this.yapeConfirmed = false;
    this.cdr.detectChanges();
  }

  // ============================================================
  // TOASTS
  // ============================================================

  pushToast(type: Toast['type'], message: string): void {
    const id = ++this.toastSeq;
    this.toasts = [...this.toasts, { id, type, message }];
    this.cdr.detectChanges();
    setTimeout(() => this.dismissToast(id), 4000);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.cdr.detectChanges();
  }

  clearCart(): void {
    if (this.cart.length === 0) return;
    if (confirm('Limpiar todo el carrito?')) {
      this.cart = [];
      this.cdr.detectChanges();
    }
  }

  getPaymentMethodLabel(method: string): string {
    switch (method?.toLowerCase()) {
      case 'efectivo': return 'Efectivo';
      case 'yape_plin': return 'Yape / Plin';
      default: return method || '-';
    }
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod = method;
    this.cdr.detectChanges();
  }

  getPaymentStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pagado': return 'status-paid';
      case 'pendiente': return 'status-pending';
      case 'anulado': return 'status-cancelled';
      default: return '';
    }
  }
}
