import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, Employee, Role } from '../../service/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  employees: Employee[] = [];
  roles: Role[] = []; // ✅ Tipado estricto usando la interfaz de tu servicio
  loading: boolean = false;
  errorMessage: string = '';

  showForm: boolean = false;
  showDeleteConfirm: boolean = false;
  editingId: number | null = null;
  employeeToDelete: number | null = null;
  searchTerm: string = ''; // ✅ Añadido para el filtro de búsqueda por username si quieres usarlo

  formData: Partial<Employee> & { password?: string } = {
    username: '',
    name: '',
    lastName: '',
    password: '',
    idRole: 0,
  };

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadRoles();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.listEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = 'Error al cargar empleados.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadRoles(): void {
    this.employeeService.listRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar roles:', err);
      },
    });
  }

  openForm(employee?: Employee): void {
    if (employee) {
      this.editingId = employee.id || null;
      this.formData = {
        ...employee,
        password: '', // Siempre vacío por seguridad al abrir edición
      };
    } else {
      this.editingId = null;
      this.formData = { username: '', name: '', lastName: '', password: '', idRole: 0 };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveEmployee(): void {
    // ✅ Validar campos obligatorios obligados por el negocio
    if (
      !this.formData.username ||
      !this.formData.name ||
      !this.formData.lastName ||
      !this.formData.idRole
    ) {
      this.errorMessage = 'Todos los campos excepto la contraseña son obligatorios.';
      return;
    }

    // ✅ Validar contraseña obligatoria solo para NUEVOS empleados
    if (!this.editingId && (!this.formData.password || this.formData.password.trim() === '')) {
      this.errorMessage = 'La contraseña es obligatoria para nuevos empleados';
      return;
    }

    const employeeToSave = { ...this.formData };

    // ✅ Si es edición y no mandaron una nueva contraseña, la borramos para no pisar el hash en la BD
    if (this.editingId && (!employeeToSave.password || employeeToSave.password.trim() === '')) {
      delete employeeToSave.password;
    }

    (this.editingId
      ? this.employeeService.updateEmployee(this.editingId, employeeToSave)
      : this.employeeService.createEmployee(employeeToSave)
    ).subscribe({
      next: () => {
        this.loadEmployees();
        this.closeForm();
      },
      error: (err: any) => {
        this.errorMessage = 'Error en la operación al guardar el empleado.';
        this.cdr.detectChanges();
      },
    });
  }

  deleteEmployee(id: number): void {
    this.employeeToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.employeeToDelete !== null) {
      this.employeeService.deleteEmployee(this.employeeToDelete).subscribe({
        next: () => {
          this.loadEmployees();
          this.cancelDelete();
        },
        error: (err: any) => {
          this.errorMessage = 'Error al eliminar el empleado.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  // ✅ Método espejo idéntico al de clientes
  editEmployee(employee: Employee): void {
    this.editingId = employee.id || null;
    this.formData = {
      ...employee,
      password: '', // Sin vulnerar el hash viejo
    };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.employeeToDelete = null;
  }

  // ✅ Buscador reactivo integrado por si quieres filtrar por nombre de usuario en tu tabla
  filteredEmployees(): Employee[] {
    if (!this.searchTerm.trim()) {
      return this.employees;
    }
    return this.employees.filter((emp) =>
      emp.username.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
}
