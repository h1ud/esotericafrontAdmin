import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PromotionDTO {
  id?: number;
  userId: number;
  username?: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  visibility: 'GLOBAL' | 'PRIVATE';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  createDate?: string;
}

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private apiUrl = '/api/admin/promotions';

  constructor(private http: HttpClient) {}

  getAllPromotions(): Observable<PromotionDTO[]> {
    return this.http.get<PromotionDTO[]>(this.apiUrl);
  }

  createPromotion(promotion: PromotionDTO): Observable<void> {
    return this.http.post<void>(this.apiUrl, promotion);
  }

  updatePromotion(id: number, promotion: PromotionDTO): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, promotion);
  }

  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPromotionByCode(code: string): Observable<PromotionDTO> {
    return this.http.get<PromotionDTO>(`/api/pos/promotions/code/${code}`);
  }
}
