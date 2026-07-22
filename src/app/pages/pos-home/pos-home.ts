import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PosMenuService, CategoryDTO, ProductDTO } from '../../service/pos-menu.service';
import { PromotionService, PromotionDTO } from '../../service/promotion.service';
import { SaleService } from '../../service/sale.service';
import { SaleListService, SaleResponse } from '../../service/sale-list.service';
import { AuthService } from '../../service/Auth/auth.service';
import { ClientService, Client } from '../../service/client.service';
import { jsPDF } from 'jspdf';
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
  subtotal: number;
  discountAmount: number;
  discountLabel: string;
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

  
  showCategoryGrid: boolean = true;
  selectedCategory: CategoryDTO | null = null;

  
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

    
  
  

  applyPromoCode(): void {
    const code = this.promoCodeInput.trim();
    if (!code) {
      this.promoError = 'Ingrese un código promocional';
      return;
    }

    this.promoLoading = true;
    this.promoError = '';
    this.appliedPromotion = null;

    this.promotionService.getPromotionByCode(code).subscribe({
      next: (promo) => {
        this.appliedPromotion = promo;
        this.promoLoading = false;
        this.pushToast('success', 'Promoción aplicada: ' + promo.title + ' (' + promo.discount + '% desc.)');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.promoLoading = false;
        this.promoError = err.error?.message || 'Código promocional no válido';
        this.cdr.detectChanges();
      },
    });
  }

  removePromoCode(): void {
    this.appliedPromotion = null;
    this.promoCodeInput = '';
    this.promoError = '';
    this.cdr.detectChanges();
  }

  
  savedCarts: { name: string; items: CartItem[] }[] = [];
  showSaveCartModal: boolean = false;
  savedCartName: string = '';
  showLoadCartModal: boolean = false;

  
  documentType: 'boleta_simple' | 'boleta_dni' | 'factura' = 'boleta_simple';
  clientDni: string = '';
  clientName: string = '';
  clientBusinessName: string = '';
  clientAddress: string = '';
  clientFound: Client | null = null;
  dniLoading: boolean = false;
  dniError: string = '';
  showNewClientForm: boolean = false;
  showBoletaPreview: boolean = false;

  
  isCheckout: boolean = false;
  paymentMethod: PaymentMethod = 'efectivo';
  amountPaid: number = 0;
  yapeConfirmed: boolean = false;
  showReceipt: boolean = false;
  receiptData: ReceiptData | null = null;
  processingPayment: boolean = false;
  receiptStep: 'document' | 'preview' | 'done' = 'document';


  
  promoCodeInput: string = '';
  appliedPromotion: PromotionDTO | null = null;
  promoLoading: boolean = false;
  promoError: string = '';

  
  recentSales: SaleResponse[] = [];
  loadingSales: boolean = false;
  showRecentSales: boolean = false;

  
  private toastSeq = 0;
  toasts: Toast[] = [];

  constructor(
    private posMenuService: PosMenuService,
    private promotionService: PromotionService,
    private clientService: ClientService,
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

  
  
  

  logout(): void {
    this.authService.logout();
    this.pushToast('info', 'Cerrando sesion...');
    this.cdr.detectChanges();
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 500);
  }

  
  
  

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

  getSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  getDiscountAmount(): number {
    if (!this.appliedPromotion) return 0;
    return this.getSubtotal() * (this.appliedPromotion.discount / 100);
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscountAmount();
  }

  getItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  
  
  

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
    this.resetDocumentState();
    this.showBoletaPreview = false;
    this.cdr.detectChanges();
  }

  cancelCheckout(): void {
    this.isCheckout = false;
    this.amountPaid = 0;
    this.yapeConfirmed = false;
    this.showBoletaPreview = false;
    this.cdr.detectChanges();
  }

  getChange(): number {
    const change = this.amountPaid - this.getTotal();
    return change > 0 ? change : 0;
  }

  
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
    this.finalizeSale();
  }

  private finalizeSale(): void {
    const saleRequest: any = {
      paymentMethod: this.paymentMethod,
      items: this.cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      documentType: this.documentType,
      clientDni: this.clientDni || null,
      clientName: this.clientName || null,
      clientBusinessName: this.clientBusinessName || null,
      clientAddress: this.clientAddress || null,
    };

    if (this.appliedPromotion) {
      saleRequest.promoCode = this.appliedPromotion.code;
    }

    this.saleService.createSale(saleRequest).subscribe({
      next: (response) => {
        this.processingPayment = false;
        this.receiptData = {
          saleId: response.saleOperationId,
          total: response.totalAmount,
          subtotal: response.subtotal || this.getSubtotal(),
          discountAmount: response.discountAmount || this.getDiscountAmount(),
          discountLabel: this.appliedPromotion ? this.appliedPromotion.code + ' (' + this.appliedPromotion.discount + '%)' : '',
          paymentMethod: this.paymentMethod,
          issueDate: response.issueDate,
          items: this.cart.map((item) => ({
            name: item.product.productName,
            qty: item.quantity,
            price: item.product.price,
          })),
        };
        this.showReceipt = true;
        this.receiptStep = 'document';
        this.cart = [];
        this.isCheckout = false;
        this.amountPaid = 0;
        this.appliedPromotion = null;
        this.promoCodeInput = '';
        this.promoError = '';
        this.loadRecentSales();
        this.loadCashStatus();
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

  goToBoletaPreview(): void {
    if (this.documentType !== 'boleta_simple') {
      if (!this.clientDni || this.clientDni.length < (this.documentType === 'factura' ? 11 : 8)) {
        this.pushToast('error', 'Debe ingresar un documento valido');
        return;
      }
      if (!this.clientFound) {
        this.pushToast('error', 'Debe buscar o registrar el cliente primero');
        return;
      }
      if (this.documentType === 'factura' && (!this.clientBusinessName.trim() || !this.clientAddress.trim())) {
        this.pushToast('error', 'Debe completar la Razon Social y Direccion');
        return;
      }
    }
    this.receiptStep = 'preview';
    this.cdr.detectChanges();
  }

  goToDone(): void {
    this.receiptStep = 'done';
    this.cdr.detectChanges();
  }

  dismissReceipt(): void {
    this.showReceipt = false;
    this.receiptData = null;
    this.receiptStep = 'document';
    this.yapeConfirmed = false;
    this.appliedPromotion = null;
    this.promoCodeInput = '';
    this.promoError = '';
    this.resetDocumentState();
    this.cdr.detectChanges();
  }

  
  
  

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

  
  
  

  downloadBoletaPDF(): void {
    if (!this.receiptData) return;
    this.goToDone();
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = 190;
    let y = 15;
    const margin = 10;

    const title = this.getDocumentTypeLabel();
    const now = new Date();
    const serie = 'B001';
    const correlativo = String(this.receiptData.saleId).padStart(8, '0');

    
    doc.setFontSize(18); doc.setTextColor(60, 40, 40);
    doc.text('ESOTERICA E.I.R.L.', margin, y); y += 6;
    doc.setFontSize(9); doc.setTextColor(100, 100, 100);
    doc.text('RUC: 20605074001', margin, y); y += 4;
    doc.text('Av. Principal 123 - Lima', margin, y); y += 4;
    doc.text('Tel: 999-888-777', margin, y); y += 8;

    
    doc.setDrawColor(180, 150, 150); doc.setLineWidth(0.5);
    doc.line(margin, y, pageW, y); y += 4;
    doc.setFontSize(16); doc.setTextColor(80, 50, 50);
    doc.text(title, pageW / 2, y, { align: 'center' }); y += 2;
    doc.setFontSize(9); doc.setTextColor(120, 120, 120);
    doc.text(serie + '-' + correlativo, pageW / 2, y, { align: 'center' }); y += 5;
    doc.line(margin, y, pageW, y); y += 5;

    
    doc.setFontSize(9); doc.setTextColor(60, 60, 60);
    doc.text('Fecha: ' + now.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), margin, y); y += 5;

    
    if (this.documentType !== 'boleta_simple' && this.clientDni) {
      doc.text('DNI: ' + this.clientDni, margin, y); y += 4;
      if (this.clientName) doc.text('Cliente: ' + this.clientName, margin, y); y += 4;
      if (this.documentType === 'factura') {
        if (this.clientBusinessName) doc.text('Razon Social: ' + this.clientBusinessName, margin, y); y += 4;
        if (this.clientAddress) doc.text('Direccion: ' + this.clientAddress, margin, y); y += 4;
      }
      y += 2;
    }

    
    doc.setDrawColor(180, 150, 150); doc.line(margin, y, pageW, y); y += 4;
    doc.setFontSize(8); doc.setTextColor(80, 50, 50); doc.setFont('helvetica', 'bold');
    const colW = [12, 78, 30, 30, 30];
    let x = margin + 2;
    doc.text('Cant', x, y); x += colW[0];
    doc.text('Descripcion', x, y); x += colW[1];
    doc.text('P.Unit', x, y, { align: 'right' }); x += colW[2];
    doc.text('Importe', x, y, { align: 'right' }); x += colW[3];
    y += 4;
    doc.setDrawColor(180, 150, 150); doc.line(margin, y, pageW, y); y += 3;

    
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(40, 40, 40);
    this.receiptData.items.forEach((item: any) => {
      if (y > 260) { doc.addPage(); y = 15; }
      x = margin + 2;
      doc.text(String(item.qty), x, y); x += colW[0];
      doc.text((item.name || '').substring(0, 28), x, y); x += colW[1];
      doc.text('S/ ' + item.price.toFixed(2), x, y, { align: 'right' }); x += colW[2];
      doc.text('S/ ' + (item.price * item.qty).toFixed(2), x, y, { align: 'right' });
      y += 5;
    });

    
    y += 2;
    doc.setDrawColor(180, 150, 150); doc.line(margin, y, pageW, y); y += 4;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text('OP. GRAVADAS', margin + 130, y);
    doc.text('S/ ' + this.receiptData.subtotal.toFixed(2), pageW, y, { align: 'right' }); y += 5;
    if (this.receiptData.discountAmount > 0) {
      doc.setTextColor(180, 50, 50);
      doc.text('DESCUENTO', margin + 130, y);
      doc.text('- S/ ' + this.receiptData.discountAmount.toFixed(2), pageW, y, { align: 'right' }); y += 5;
      doc.setTextColor(40, 40, 40);
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('TOTAL A PAGAR', margin + 130, y);
    doc.text('S/ ' + this.receiptData.total.toFixed(2), pageW, y, { align: 'right' }); y += 6;

    
    y = Math.max(y, 260);
    doc.setDrawColor(180, 150, 150); doc.line(margin, y, pageW, y); y += 4;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(140, 140, 140);
    doc.text('Representacion impresa de la ' + title, pageW / 2, y, { align: 'center' }); y += 3;
    doc.text('Autorizado mediante Res. N. 000-2026/SUNAT', pageW / 2, y, { align: 'center' }); y += 3;
    doc.text('Consulta tu comprobante en: www.esoterica.pe/validar', pageW / 2, y, { align: 'center' });

    doc.save('boleta_' + serie + '-' + correlativo + '.pdf');
  }

  
  
  

  selectDocumentType(type: 'boleta_simple' | 'boleta_dni' | 'factura'): void {
    this.documentType = type;
    this.showBoletaPreview = false;
    this.dniError = '';
    this.showNewClientForm = false;
    if (type === 'boleta_simple') {
      this.clientDni = '';
      this.clientName = '';
      this.clientBusinessName = '';
      this.clientAddress = '';
      this.clientFound = null;
    }
    this.cdr.detectChanges();
  }

  resetDocumentState(): void {
    this.documentType = 'boleta_simple';
    this.clientDni = '';
    this.clientName = '';
    this.clientBusinessName = '';
    this.clientAddress = '';
    this.clientFound = null;
    this.dniLoading = false;
    this.dniError = '';
    this.showNewClientForm = false;
    this.showBoletaPreview = false;
  }

  lookupClientByDni(): void {
    const dni = this.clientDni.trim();
    if (dni.length < 8) {
      this.dniError = 'Ingrese un DNI válido (8 dígitos)';
      return;
    }
    this.dniLoading = true;
    this.dniError = '';
    this.clientFound = null;
    this.showNewClientForm = false;

    this.clientService.findByDni(dni).subscribe({
      next: (client) => {
        this.clientFound = client;
        this.clientName = client.name;
        this.dniLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.dniLoading = false;
        
        this.showNewClientForm = true;
        this.clientName = '';
        this.cdr.detectChanges();
      },
    });
  }

  quickRegisterClient(): void {
    if (!this.clientName.trim()) {
      this.dniError = 'Ingrese el nombre del cliente';
      return;
    }
    this.dniLoading = true;
    this.dniError = '';

    this.clientService.quickRegister({
      name: this.clientName,
      dni: this.clientDni,
      password_hash: 'default123',
      birthdayDate: new Date().toISOString().split('T')[0],
    }).subscribe({
      next: (client) => {
        this.clientFound = client;
        this.dniLoading = false;
        this.showNewClientForm = false;
        this.pushToast('success', 'Cliente registrado correctamente');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dniLoading = false;
        this.dniError = err.error?.error || 'Error al registrar cliente';
        this.cdr.detectChanges();
      },
    });
  }

  goBackFromPreview(): void {
    this.showBoletaPreview = false;
    this.cdr.detectChanges();
  }

  getDocumentTypeLabel(): string {
    switch (this.documentType) {
      case 'boleta_simple': return 'Boleta Simple';
      case 'boleta_dni': return 'Boleta con DNI';
      case 'factura': return 'Factura';
      default: return 'Boleta Simple';
    }
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