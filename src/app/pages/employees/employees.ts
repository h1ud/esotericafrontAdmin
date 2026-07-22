import { Component, OnInit, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { EmployeeService, Employee, Role } from '../../service/employee.service';
import { TableBaseComponent, TableColumn } from '../../component/table-base/table-base';

interface EmployeeForm {
  username: FormControl<string>;
  name: FormControl<string>;
  lastName: FormControl<string>;
  password: FormControl<string>;
  idRole: FormControl<number>;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableBaseComponent],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  readonly employees = signal<Employee[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly loading = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly errorMessage = signal<string | null>(null);

  readonly showForm = signal<boolean>(false);
  readonly showDeleteConfirm = signal<boolean>(false);
  readonly showDetail = signal<boolean>(false);
  readonly editingId = signal<number | null>(null);
  readonly employeeToDelete = signal<number | null>(null);
  readonly selectedEmployee = signal<Employee | null>(null);

  readonly toasts = signal<Toast[]>([]);
  private toastSeq = 0;

  
  employeeForm: FormGroup<EmployeeForm>;

  
  readonly employeeColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Nombre' },
    { key: 'lastName', label: 'Apellido' },
    { key: 'roleName', label: 'Rol' },
    { key: 'createDate', label: 'Registro' },
    { key: 'actions', label: 'Acciones', width: '150px' },
  ];

  
  readonly filteredEmployees = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.employees();
    return this.employees().filter(e =>
      e.username.toLowerCase().includes(term) ||
      e.name.toLowerCase().includes(term) ||
      e.lastName.toLowerCase().includes(term)
    );
  });

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder,
  ) {
    this.employeeForm = this.fb.group<EmployeeForm>({
      username: this.fb.control('', { validators: [Validators.required, Validators.maxLength(50)], nonNullable: true }),
      name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)], nonNullable: true }),
      lastName: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)], nonNullable: true }),
      password: this.fb.control('', { validators: [], nonNullable: true }),
      idRole: this.fb.control(0, { validators: [Validators.required, Validators.min(1)], nonNullable: true }),
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadRoles();
  }

  
  
  

  loadEmployees(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.employeeService.listEmployees().subscribe({
      next: (data: Employee[]) => {
        this.employees.set(data ?? []);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage.set('Error al cargar empleados.');
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  loadRoles(): void {
    this.employeeService.listRoles().subscribe({
      next: (data: Role[]) => {
        this.roles.set(data);
        this.cdr.detectChanges();
      },
      error: () => {
        this.pushToast('error', 'Error al cargar roles');
      },
    });
  }

  
  
  

  openForm(employee?: Employee): void {
    if (employee) {
      this.editingId.set(employee.id ?? null);
      this.employeeForm.patchValue({
        username: employee.username,
        name: employee.name,
        lastName: employee.lastName,
        password: '',
        idRole: employee.idRole,
      });
      
      this.employeeForm.controls.password.setValidators([]);
    } else {
      this.editingId.set(null);
      this.employeeForm.reset({ username: '', name: '', lastName: '', password: '', idRole: 0 });
      
      this.employeeForm.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.employeeForm.controls.password.updateValueAndValidity();
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.employeeForm.reset();
    this.editingId.set(null);
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid) {
      Object.values(this.employeeForm.controls).forEach(c => {
        c.markAsTouched();
        c.markAsDirty();
      });
      this.pushToast('error', 'Corrige los errores del formulario antes de guardar');
      return;
    }

    const isEdit = !!this.editingId();
    const raw = this.employeeForm.getRawValue();
    const payload: any = { ...raw };

    if (isEdit && (!payload.password || payload.password.trim() === '')) {
      delete payload.password;
    }

    const obs$ = isEdit
      ? this.employeeService.updateEmployee(this.editingId()!, payload)
      : this.employeeService.createEmployee(payload);

    obs$.subscribe({
      next: () => {
        this.pushToast('success', isEdit ? 'Empleado actualizado' : 'Empleado creado');
        this.loadEmployees();
        this.closeForm();
      },
      error: () => {
        this.pushToast('error', 'Error al guardar el empleado');
        this.cdr.detectChanges();
      },
    });
  }

  editEmployee(employee: Employee): void {
    this.openForm(employee);
  }

  
  
  

  viewEmployee(employee: Employee): void {
    this.selectedEmployee.set(employee);
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
    this.selectedEmployee.set(null);
  }

  
  
  

  deleteEmployee(id: number): void {
    this.employeeToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const id = this.employeeToDelete();
    if (id === null) return;

    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.employees.update(list => list.filter(e => e.id !== id));
        this.pushToast('success', 'Empleado eliminado');
        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: () => {
        this.pushToast('error', 'Error al eliminar el empleado');
        this.cdr.detectChanges();
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.employeeToDelete.set(null);
  }

  
  
  

  pushToast(type: Toast['type'], message: string): void {
    const id = ++this.toastSeq;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismissToast(id), 3200);
  }

  dismissToast(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  
  
  

  getInitials(name: string, lastName: string): string {
    return (name[0] ?? '').toUpperCase() + (lastName[0] ?? '').toUpperCase();
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getRoleName(roleId: number): string {
    return this.roles().find(r => r.id === roleId)?.roleName ?? `Rol #${roleId}`;
  }
}