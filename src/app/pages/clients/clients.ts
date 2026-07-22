  import {
  Component,
  OnInit,
  ChangeDetectorRef,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ClientService, Client } from '../../service/client.service';
import { TableBaseComponent, TableColumn } from '../../component/table-base/table-base';


const MOCK_CLIENTS: Client[] = [
  { id: 1, name: 'Lucía Rodríguez',  dni: '45678901', birthdayDate: '1995-03-12', createDate: '2024-11-02' },
  { id: 2, name: 'Carlos Mendoza',   dni: '12345678', birthdayDate: '1988-07-22', createDate: '2024-10-15' },
  { id: 3, name: 'Ana Quispe',       dni: '87654321', birthdayDate: '1992-11-05', createDate: '2024-09-28' },
  { id: 4, name: 'Jorge Castañeda',  dni: '45612378', birthdayDate: '1990-01-30', createDate: '2024-09-10' },
  { id: 5, name: 'María Fernanda T.', dni: '78945612', birthdayDate: '1996-05-18', createDate: '2024-08-22' },
  { id: 6, name: 'Pedro Salazar',    dni: '32165498', birthdayDate: '1985-12-03', createDate: '2024-08-01' },
  { id: 7, name: 'Sofía Vega',       dni: '14785236', birthdayDate: '1998-09-14', createDate: '2024-07-19' },
  { id: 8, name: 'Diego Ramírez',    dni: '96385274', birthdayDate: '1987-04-25', createDate: '2024-07-05' },
];


interface ClientForm {
  name: FormControl<string>;
  dni: FormControl<string>;
  password_hash: FormControl<string>;
  birthdayDate: FormControl<string>;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableBaseComponent],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export
class Clients implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  
  readonly clients = signal<Client[]>([]);
  readonly loading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  readonly showForm = signal<boolean>(false);
  readonly showDeleteConfirm = signal<boolean>(false);
  readonly showDetail = signal<boolean>(false);
  readonly editingId = signal<number | null>(null);
  readonly clientToDelete = signal<number | null>(null);
  readonly selectedClient = signal<Client | null>(null);

  
  clientForm: FormGroup<ClientForm>;

  readonly errorMessage = signal<string | null>(null);

  readonly toasts = signal<Toast[]>([]);
  private toastSeq = 0;

  
  
  
  readonly filterDateFrom = signal<string>('');
  readonly filterDateTo = signal<string>('');
  readonly filterAgeMin = signal<number | null>(null);
  readonly filterAgeMax = signal<number | null>(null);
  readonly showFilters = signal<boolean>(false);

  
  
  

  
  readonly filteredClients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const dateFrom = this.filterDateFrom();
    const dateTo = this.filterDateTo();
    const ageMin = this.filterAgeMin();
    const ageMax = this.filterAgeMax();

    let result = this.clients();

    
    if (term) {
      result = result.filter(c => {
        const name = c.name.toLowerCase();
        const dni = c.dni;
        const idStr = String(c.id ?? '');
        return name.includes(term) || dni.includes(term) || idStr.includes(term);
      });
    }

    
    if (dateFrom) {
      result = result.filter(c => !c.createDate || c.createDate >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(c => !c.createDate || c.createDate <= dateTo);
    }

    
    if (ageMin !== null || ageMax !== null) {
      result = result.filter(c => {
        const age = this.getAge(c.birthdayDate);
        if (age === null) return false;
        if (ageMin !== null && age < ageMin) return false;
        if (ageMax !== null && age > ageMax) return false;
        return true;
      });
    }

    return result;
  });

  
  readonly totalCount = computed(() => this.filteredClients().length);

  
  readonly clientColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'name', label: 'Nombre' },
    { key: 'dni', label: 'DNI' },
    { key: 'birthdayDate', label: 'Nacimiento' },
    { key: 'age', label: 'Edad', width: '80px' },
    { key: 'createDate', label: 'Registro' },
    { key: 'actions', label: 'Acciones', width: '150px' },
  ];
  constructor(
    private clientService: ClientService,
    private fb: FormBuilder,
  ) {
    this.clientForm = this.fb.group<ClientForm>({
      name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)], nonNullable: true }),
      dni: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)],
        nonNullable: true,
      }),
      password_hash: this.fb.control('', { validators: [], nonNullable: true }),
      birthdayDate: this.fb.control('', { validators: [], nonNullable: true }),
    });
  }

  
  
  
  ngOnInit(): void {
    this.loadClients();
  }

  
  
  
  loadClients(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.clientService.listClients().subscribe({
      next: (data: Client[]) => {
        this.clients.set(data ?? []);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage.set('Error al cargar clientes desde el servidor. Mostrando datos de respaldo.');
        
        this.clients.set(MOCK_CLIENTS);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  
  
  
  openForm(client?: Client): void {
    if (client) {
      this.editingId.set(client.id ?? null);
      this.clientForm.patchValue({
        name: client.name,
        dni: client.dni,
        password_hash: '',
        birthdayDate: client.birthdayDate ?? '',
      });
      
      this.clientForm.controls.password_hash.setValidators([]);
    } else {
      this.editingId.set(null);
      this.clientForm.reset();
      
      this.clientForm.controls.password_hash.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.clientForm.controls.password_hash.updateValueAndValidity();
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.clientForm.reset();
    this.editingId.set(null);
  }

  saveClient(): void {
    if (this.clientForm.invalid) {
      
      Object.values(this.clientForm.controls).forEach(c => {
        c.markAsTouched();
        c.markAsDirty();
      });
      this.pushToast('error', 'Corrige los errores del formulario antes de guardar');
      return;
    }

    const isEdit = !!this.editingId();
    const raw = this.clientForm.getRawValue();

    const payload: Client = { ...raw };
    if (isEdit && (!payload.password_hash || payload.password_hash.trim() === '')) {
      delete payload.password_hash;
    }

    const obs$ = isEdit
      ? this.clientService.updateClient(this.editingId()!, payload)
      : this.clientService.createClient(payload);

    obs$.subscribe({
      next: () => {
        this.pushToast('success', isEdit ? 'Cliente actualizado' : 'Cliente creado');
        this.loadClients();
        this.closeForm();
      },
      error: () => {
        
        if (isEdit) {
          this.clients.update(list => list.map(c =>
            c.id === this.editingId() ? { ...c, ...payload } : c,
          ));
          this.pushToast('success', 'Cliente actualizado (mock)');
        } else {
          const newId = Math.max(0, ...this.clients().map(c => c.id ?? 0)) + 1;
          this.clients.update(list => [
            { ...payload, id: newId, createDate: new Date().toISOString().slice(0, 10) },
            ...list,
          ]);
          this.pushToast('success', 'Cliente creado (mock)');
        }
        this.closeForm();
        this.cdr.detectChanges();
      },
    });
  }

  editClient(client: Client): void {
    this.openForm(client);
  }

  
  
  
  viewClient(client: Client): void {
    this.selectedClient.set(client);
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
    this.selectedClient.set(null);
  }

  
  
  
  deleteClient(id: number): void {
    this.clientToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.clientToDelete();
    if (id === null) return;

    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.clients.update(list => list.filter(c => c.id !== id));
        this.pushToast('success', 'Cliente eliminado');
        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: () => {
        
        this.clients.update(list => list.filter(c => c.id !== id));
        this.pushToast('success', 'Cliente eliminado (mock)');
        this.cancelDelete();
        this.cdr.detectChanges();
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.clientToDelete.set(null);
  }

  
  
  
  pushToast(type: Toast['type'], message: string): void {
    const id = ++this.toastSeq;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismissToast(id), 3200);
  }

  dismissToast(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  
  
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase();
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getAge(birthday: string): number | null {
    if (!birthday) return null;
    const b = new Date(birthday);
    if (Number.isNaN(b.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  }



  
  
  
  setFilterAgeMin(value: string): void {
    this.filterAgeMin.set(value ? parseInt(value, 10) : null);
  }

  setFilterAgeMax(value: string): void {
    this.filterAgeMax.set(value ? parseInt(value, 10) : null);
  }

  clearFilters(): void {
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterAgeMin.set(null);
    this.filterAgeMax.set(null);
    this.searchTerm.set('');
  }


}