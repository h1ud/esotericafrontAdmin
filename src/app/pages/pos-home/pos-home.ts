import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosMenuService, CategoryDTO, ProductDTO } from '../../service/pos-menu.service';
import { SaleService } from '../../service/sale.service';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
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

  selectedCategoryId: number | null = null;
  loading: boolean = false;
  errorMessage: string = '';

  isCheckout: boolean = false;
  paymentMethod: string = 'EFECTIVO';
  amountPaid: number = 0;

  constructor(
    private posMenuService: PosMenuService,
    private saleService: SaleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
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
        this.errorMessage = 'Error al conectar con el servidor de categorías.';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  selectCategory(id: number): void {
    this.selectedCategoryId = id;
    this.loading = true;
    this.errorMessage = '';

    this.posMenuService.getProductsByCategory(id).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los productos de esta categoría.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      },
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

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  goToCheckout(): void {
    if (this.cart.length === 0) {
      alert('¡El carrito está vacío, mano!');
      return;
    }
    this.isCheckout = true;
    this.cdr.detectChanges();
  }

  cancelCheckout(): void {
    this.isCheckout = false;
    this.amountPaid = 0;
    this.cdr.detectChanges();
  }

  getChange(): number {
    const change = this.amountPaid - this.getTotal();
    return change > 0 ? change : 0;
  }

  confirmPayment(): void {
    const saleRequest = {
      userId: 1,
      paymentMethod: this.paymentMethod,
      items: this.cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.saleService.createSale(saleRequest).subscribe({
      next: (response) => {
        console.log('¡Venta exitosa!', response);
        alert('Venta registrada con éxito: ' + response.saleOperationId);
        this.cart = [];
        this.isCheckout = false;
        this.amountPaid = 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        alert('Hubo un error al procesar el pago');
      },
    });
  }
}
