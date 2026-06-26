import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../../service/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employees.html', // ✅ Asegúrate que sea .component.html
  styleUrls: ['./employees.css'],
})
export class Employees implements OnInit {
  employees: Employee[] = [];
  roles: any[] = []; // Carga esto de tu API

  loading: boolean = false;
  errorMessage: string = '';
  showForm: boolean = false;
  showDeleteConfirm: boolean = false;
  editingId: number | null = null;
  employeeToDelete: number | null = null;

  // ✅ Cambiado de roleId a idRole para coincidir con el backend
  formData: any = {
    username: '',
    name: '',
    lastName: '',
    password: '',
    idRole: '',
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
    this.errorMessage = '';
    this.employeeService.listEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
        this.errorMessage = 'Error al cargar empleados.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadRoles(): void {
    this.employeeService.listRoles().subscribe({
      next: (data) => {
        this.roles = data; // Aquí guardas la lista de roles
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar roles:', err),
    });
  }

  // ✅ Método unificado para abrir el formulario (crear nuevo)
  openForm(): void {
    this.editingId = null;
    this.formData = {
      username: '',
      name: '',
      lastName: '',
      password: '',
      idRole: '',
    };
    this.showForm = true;
  }

  // ✅ Método unificado para editar
  editEmployee(employee: Employee): void {
    this.editingId = employee.id || null;
    this.formData = {
      username: employee.username,
      name: employee.name,
      lastName: employee.lastName,
      password: '', // Siempre vacío en edición
      idRole: (employee as any).role ? (employee as any).role.id : employee.idRole,
    };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveEmployee(): void {
    // ✅ Validaciones mejoradas
    if (
      !this.formData.username ||
      !this.formData.name ||
      !this.formData.lastName ||
      !this.formData.idRole
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    // Validar contraseña solo para nuevos empleados
    if (!this.editingId && (!this.formData.password || this.formData.password.trim() === '')) {
      this.errorMessage = 'La contraseña es obligatoria para nuevos empleados';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // ✅ Preparar datos para enviar
    const employeeData = { ...this.formData };

    // Si es edición y no hay contraseña, la eliminamos
    if (this.editingId && (!employeeData.password || employeeData.password.trim() === '')) {
      delete employeeData.password;
    }

    const action = this.editingId
      ? this.employeeService.updateEmployee(this.editingId, employeeData)
      : this.employeeService.createEmployee(employeeData);

    action.subscribe({
      next: () => {
        this.loadEmployees();
        this.closeForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.errorMessage = error.error?.message || 'Error al guardar el empleado.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteEmployee(id: number): void {
    this.employeeToDelete = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.employeeToDelete) {
      this.loading = true;
      this.employeeService.deleteEmployee(this.employeeToDelete).subscribe({
        next: () => {
          this.loadEmployees();
          this.cancelDelete();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al eliminar el empleado.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.employeeToDelete = null;
  }
}
