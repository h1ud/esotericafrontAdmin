import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductDTO {
  id?: number;
  productName: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: number;
  categoryName?: string;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private apiUrl = 'http://localhost:8080/api/admin/menu'; // Ajusta el puerto si tu Spring corre en otro

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(this.apiUrl);
  }

  createProduct(product: ProductDTO): Observable<ProductDTO> {
    return this.http.post<ProductDTO>(this.apiUrl, product);
  }

  updateProduct(id: number, product: ProductDTO): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
