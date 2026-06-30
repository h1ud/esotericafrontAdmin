import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromotionService, PromotionDTO } from '../../service/promotion.service';

@Component({
  selector: 'app-promotion-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './codes.html',
  styleUrl: './codes.css',
})
export class Codes implements OnInit {
  promotions: PromotionDTO[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  showForm: boolean = false;
  showDeleteConfirm: boolean = false;
  editingId: number | null = null;
  promotionToDelete: number | null = null;
  searchTerm: string = '';

  formData: Partial<PromotionDTO> = {
    userId: 1, // Por ahora quemado en 1 o cámbialo según tu login actual
    title: '',
    description: '',
    discount: 0, // O el valor por defecto de tu negocio
    visibility: 'GLOBAL',
    isActive: true,
    startDate: '',
    endDate: '',
    imageUrl: '',
  };

  constructor(
    private promotionService: PromotionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.loading = true;
    this.promotionService.getAllPromotions().subscribe({
      next: (data: PromotionDTO[]) => {
        this.promotions = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'Error al cargar promociones.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(promotion?: PromotionDTO): void {
    if (promotion) {
      this.editingId = promotion.id || null;
      this.formData = { ...promotion };
    } else {
      this.editingId = null;
      this.formData = {
        userId: 1,
        title: '',
        description: '',
        discount: 0,
        visibility: 'GLOBAL',
        isActive: true,
        startDate: '',
        endDate: '',
        imageUrl: '',
      };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  savePromotion(): void {
    if (!this.formData.title || this.formData.discount === undefined || !this.formData.startDate) {
      this.errorMessage = 'El título, el descuento y la fecha de inicio son obligatorios.';
      return;
    }

    const promotionToSave = { ...this.formData } as PromotionDTO;

    (this.editingId
      ? this.promotionService.updatePromotion(this.editingId, promotionToSave)
      : this.promotionService.createPromotion(promotionToSave)
    ).subscribe({
      next: () => {
        this.loadPromotions();
        this.closeForm();
      },
      error: (err: any) => {
        this.errorMessage = 'Error en la operación.';
        this.cdr.detectChanges();
      },
    });
  }

  deletePromotion(id: number): void {
    this.promotionToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.promotionToDelete !== null) {
      this.promotionService.deletePromotion(this.promotionToDelete).subscribe({
        next: () => {
          this.loadPromotions();
          this.cancelDelete();
        },
        error: (err: any) => {
          this.errorMessage = 'Error al eliminar.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  editPromotion(promotion: PromotionDTO): void {
    this.editingId = promotion.id || null;
    this.formData = { ...promotion };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.promotionToDelete = null;
  }

  filteredPromotions(): PromotionDTO[] {
    if (!this.searchTerm.trim()) {
      return this.promotions;
    }
    return this.promotions.filter((promo) =>
      promo.title.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
}
