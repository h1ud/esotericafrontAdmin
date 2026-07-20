import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuService, ProductDTO } from '../../service/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css'],
})
export class Menu implements OnInit {
  categories = [
    { id: 1, name: 'Sándwiches' },
    { id: 2, name: 'Empanadas' },
    { id: 3, name: 'Choripanes' },
    { id: 4, name: 'Portelilos' },
    { id: 5, name: 'Cremas' },
    { id: 6, name: 'Toppings' },
    { id: 7, name: 'Postres Helados' },
    { id: 8, name: 'Bebidas' },
    { id: 9, name: 'Especiales' },
  ];

  products: ProductDTO[] = [];
  errorMessage: string = '';
  loading: boolean = false;
  showForm: boolean = false;
  showDeleteConfirm: boolean = false;
  editingId: number | null = null;
  productIdToDelete: number | null = null;

  formData: ProductDTO = {
    productName: '',
    description: '',
    price: 0,
    categoryId: 1,
    isAvailable: true,
  };

  // 2. Inyectado cdr en el constructor junto al servicio
  constructor(
    private menuService: MenuService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.menuService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.cdr.detectChanges(); // Fuerza el renderizado al traer la lista global
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los productos del menú.';
        this.loading = false;
        this.cdr.detectChanges(); // Asegura que se pinte el mensaje de error
        console.error(err);
      },
    });
  }

  getProductsByCategory(categoryId: number): ProductDTO[] {
    return this.products.filter((p) => p.categoryId === categoryId);
  }

  openForm(categoryId: number): void {
    this.editingId = null;
    this.formData = {
      productName: '',
      description: '',
      price: 0,
      categoryId: categoryId,
      isAvailable: true,
    };
    this.showForm = true;
    this.cdr.detectChanges(); // Fuerza apertura limpia del modal
  }

  editProduct(product: ProductDTO): void {
    this.editingId = product.id || null;
    this.formData = { ...product };
    this.showForm = true;
    this.cdr.detectChanges(); // Muestra el modal con los datos cargados para editar
  }

  saveProduct(): void {
    if (!this.formData.productName || this.formData.price <= 0) {
      this.errorMessage = 'Por favor, complete los campos obligatorios.';
      this.cdr.detectChanges();
      return;
    }

    if (this.editingId) {
      this.menuService.updateProduct(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => {
          this.errorMessage = 'Error al actualizar el producto.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.menuService.createProduct(this.formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => {
          this.errorMessage = 'Error al guardar el producto.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  deleteProduct(id: number): void {
    this.productIdToDelete = id;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges(); // Fuerza que aparezca el modal de confirmación
  }

  confirmDelete(): void {
    if (this.productIdToDelete) {
      this.menuService.deleteProduct(this.productIdToDelete).subscribe({
        next: () => {
          this.loadProducts();
          this.cancelDelete();
        },
        error: (err) => {
          this.errorMessage = 'Error al eliminar el producto.';
          this.cancelDelete();
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.productIdToDelete = null;
    this.cdr.detectChanges(); // Cierra el modal de borrado de inmediato
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.errorMessage = '';
    this.cdr.detectChanges(); // Cierra el formulario limpiando el DOM
  }
}
