import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Definimos una interfaz interna para estructurar los productos
interface ProductItem {
  id?: number;
  productName: string;
  description: string;
  price: number;
  categoryId: number; // 1: Bebidas, 2: Empanadas, 3: Ensaladas
  isAvailable: boolean;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
})
export class Menu {
  // Lista de categorías fijas
  categories = [
    { id: 1, name: 'Bebidas' },
    { id: 2, name: 'Empanadas' },
    { id: 3, name: 'Ensaladas' },
  ];

  // Productos iniciales de ejemplo (Simulando la base de datos)
  products: ProductItem[] = [
    {
      id: 1,
      productName: 'Chicha Morada 1L',
      description: 'Deliciosa chicha natural de la casa',
      price: 12.0,
      categoryId: 1,
      isAvailable: true,
    },
    {
      id: 2,
      productName: 'Empanada de Carne',
      description: 'Carne picada a cuchillo con huevo y aceituna',
      price: 7.5,
      categoryId: 2,
      isAvailable: true,
    },
    {
      id: 3,
      productName: 'Ensalada Caprese',
      description: 'Tomate, mozzarella fresca y albahaca con oliva',
      price: 18.0,
      categoryId: 3,
      isAvailable: true,
    },
  ];

  // Objeto unificado para el formulario (Crear / Editar)
  formData: ProductItem = {
    productName: '',
    description: '',
    price: 0,
    categoryId: 1, // Por defecto Bebidas
    isAvailable: true,
  };

  editingId: number | null = null;
  showForm: boolean = false;

  // Filtra los productos según el ID de categoría que le pidas en el HTML
  getProductsByCategory(categoryId: number): ProductItem[] {
    return this.products.filter((p) => p.categoryId === Number(categoryId));
  }

  // Abre el formulario para crear uno nuevo
  openCreateForm(categoryId: number): void {
    this.editingId = null;
    this.formData = {
      productName: '',
      description: '',
      price: 0,
      categoryId: categoryId, // Inicializa con la categoría de la lista donde diste click
      isAvailable: true,
    };
    this.showForm = true;
  }

  // Carga los datos de un producto para editarlo
  editProduct(product: ProductItem): void {
    this.editingId = product.id || null;
    this.formData = { ...product }; // Clonamos el objeto
    this.showForm = true;
  }

  // Guarda los cambios (Sirve para Crear y para Actualizar)
  saveProduct(): void {
    if (!this.formData.productName || this.formData.price <= 0) {
      alert('Por favor, rellena los campos obligatorios.');
      return;
    }

    if (this.editingId) {
      // ACTUALIZAR (Simulado)
      const index = this.products.findIndex((p) => p.id === this.editingId);
      if (index !== -1) {
        this.products[index] = { ...this.formData };
      }
    } else {
      // CREAR (Simulado)
      const newId =
        this.products.length > 0 ? Math.max(...this.products.map((p) => p.id || 0)) + 1 : 1;
      const newProduct: ProductItem = {
        ...this.formData,
        id: newId,
      };
      this.products.push(newProduct);
    }

    this.closeForm();
  }

  // Borra un producto de la lista
  deleteProduct(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.products = this.products.filter((p) => p.id !== id);
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }
}
