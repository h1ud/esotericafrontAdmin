import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientService, Client } from '../../service/client.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  clients: Client[] = [];
  loading: boolean = false;
  errorMessage: string = '';

  showForm: boolean = false;
  showDeleteConfirm: boolean = false;
  editingId: number | null = null;
  clientToDelete: number | null = null;
  searchTerm: string = '';

  formData: Partial<Client> = {
    name: '',
    password_hash: '',
    dni: '',
    birthdayDate: '',
  };

  constructor(
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.listClients().subscribe({
      next: (data: Client[]) => {
        this.clients = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'Error al cargar clientes.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openForm(client?: Client): void {
    if (client) {
      this.editingId = client.id || null;
      this.formData = { ...client };
    } else {
      this.editingId = null;
      this.formData = { name: '', password_hash: '', dni: '', birthdayDate: '' };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  saveClient(): void {
    if (!this.formData.name || !this.formData.dni || !this.formData.password_hash) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    const clientToSave = this.formData as Client;

    (this.editingId
      ? this.clientService.updateClient(this.editingId, clientToSave)
      : this.clientService.createClient(clientToSave)
    ).subscribe({
      next: () => {
        this.loadClients();
        this.closeForm();
      },
      error: (err: any) => {
        this.errorMessage = 'Error en la operación.';
        this.cdr.detectChanges();
      },
    });
  }

  deleteClient(id: number): void {
    this.clientToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.clientToDelete !== null) {
      this.clientService.deleteClient(this.clientToDelete).subscribe({
        next: () => {
          this.loadClients();
          this.cancelDelete();
        },
        error: (err: any) => {
          this.errorMessage = 'Error al eliminar.';
          this.cdr.detectChanges();
        },
      });
    }
  }
  // Asegúrate de que esto esté dentro de la clase Clients
  editClient(client: Client): void {
    this.editingId = client.id || null;
    this.formData = { ...client };
    this.showForm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.clientToDelete = null;
  }
  filteredClients(): Client[] {
    if (!this.searchTerm.trim()) {
      return this.clients;
    }
    return this.clients.filter((client) => client.dni.includes(this.searchTerm));
  }
}
