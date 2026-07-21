import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Estructuras idénticas a tus DTOs de Spring Boot
export interface CategoryDTO {
  id: number;
  categoryName: string;
  description?: string;
}

export interface ProductDTO {
  id: number;
  productName: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  categoryId: number;
  categoryName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PosMenuService {
  private baseUrl = '/api/pos/menu';

  private categoriesUrl = '/api/pos/menu/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(this.categoriesUrl);
  }

  getProductsByCategory(categoryId: number): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.baseUrl}/category/${categoryId}`);
  }
}
