import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import { LoginService } from 'src/app/services/login.service';
import { User } from 'src/app/models/User';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkIfAdmin();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      dni: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      celular: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(9),
        Validators.maxLength(9)
      ]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER']
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  checkIfAdmin(): void {
    const role = this.loginService.showRole();
    this.isAdmin = role === 'ADMIN';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const user: User = {
        dni: this.registerForm.value.dni,
        nombres: this.registerForm.value.nombres,
        apellidos: this.registerForm.value.apellidos,
        email: this.registerForm.value.email,
        celular: this.registerForm.value.celular,
        username: this.registerForm.value.username,
        password: this.registerForm.value.password,
        role: this.registerForm.value.role,
        enabled: true
      };

      // Usar el método register en lugar de insert
      this.usersService.register(user).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = '¡Registro exitoso! Redirigiendo...';

          this.snackBar.open('Usuario registrado exitosamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });

          setTimeout(() => {
            this.router.navigate(['/components/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en registro:', error);

          if (error.status === 409) {
            this.errorMessage = 'El usuario o email ya existe';
          } else if (error.status === 400) {
            this.errorMessage = 'Datos inválidos. Verifique la información';
          } else if (error.status === 403) {
            this.errorMessage = 'Acceso denegado. Contacte al administrador';
          } else {
            this.errorMessage = 'Error al registrar usuario. Intente nuevamente';
          }

          this.snackBar.open(this.errorMessage, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // Marcar todos los campos como touched para mostrar errores
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}