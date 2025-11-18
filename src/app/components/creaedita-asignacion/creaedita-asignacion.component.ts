import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsignacionDocente } from 'src/app/models/AsignacionDocente';
import { User } from 'src/app/models/User';
import { Curso } from 'src/app/models/Curso';
import { AsignacionDocenteService } from 'src/app/services/asignacion-docente.service';
import { UsersService } from 'src/app/services/users.service';
import { CursoService } from 'src/app/services/curso.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-creaedita-asignacion',
  templateUrl: './creaedita-asignacion.component.html',
  styleUrls: ['./creaedita-asignacion.component.css']
})
export class CreaeditaAsignacionComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  asignacion: AsignacionDocente = new AsignacionDocente();
  mensaje: string = '';
  id: number = 0;
  edicion: boolean = false;
  isLoading: boolean = false;

  listaDocentes: User[] = [];
  listaCursos: Curso[] = [];

  grados = [
    { value: 'Primero', viewValue: 'Primero' },
    { value: 'Segundo', viewValue: 'Segundo' },
    { value: 'Tercero', viewValue: 'Tercero' },
    { value: 'Cuarto', viewValue: 'Cuarto' },
    { value: 'Quinto', viewValue: 'Quinto' }
  ];

  secciones = [
    { value: 'A', viewValue: 'A' },
    { value: 'B', viewValue: 'B' },
    { value: 'C', viewValue: 'C' },
    { value: 'D', viewValue: 'D' },
    { value: 'E', viewValue: 'E' }
  ];

  constructor(
    private adS: AsignacionDocenteService,
    private uS: UsersService,
    private cS: CursoService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((data) => {
      this.id = data['id'];
      this.edicion = data['id'] != null;
      this.init();
    });

    this.form = this.formBuilder.group({
      idAsignacion: [''],
      idDocente: ['', Validators.required],
      idCurso: ['', Validators.required],
      grado: ['', Validators.required],
      seccion: ['', Validators.required],
      anioAcademico: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]]
    });

    this.loadData();
  }

  loadData(): void {
    // Cargar solo usuarios con rol ADMIN (docentes)
    this.uS.list().subscribe((data) => {
      this.listaDocentes = data.filter(u => u.role === 'USER' || u.role === 'ADMIN');
    });

    this.cS.list().subscribe((data) => {
      this.listaCursos = data;
    });
  }

  aceptar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.mensaje = '';

      this.asignacion.idAsignacion = this.form.value.idAsignacion;
      this.asignacion.idDocente = this.form.value.idDocente;
      this.asignacion.idCurso = this.form.value.idCurso;
      this.asignacion.grado = this.form.value.grado;
      this.asignacion.seccion = this.form.value.seccion;
      this.asignacion.anioAcademico = this.form.value.anioAcademico;
      this.asignacion.enabled = true;

      const operation = this.edicion
        ? this.adS.update(this.asignacion)
        : this.adS.insert(this.asignacion);

      operation.pipe(
        switchMap(() => this.adS.list())
      ).subscribe({
        next: (data) => {
          this.adS.setList(data);
          this.isLoading = false;

          this.snackBar.open(
            this.edicion ? 'Asignación actualizada exitosamente' : 'Asignación registrada exitosamente',
            'Cerrar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );

          this.router.navigate(['components/asignaciones']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error:', error);

          if (error.status === 409) {
            this.mensaje = 'Ya existe una asignación con estos datos.';
          } else {
            this.mensaje = 'Error al guardar la asignación. Intente nuevamente.';
          }

          this.snackBar.open(this.mensaje, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.mensaje = 'Por favor complete todos los campos obligatorios correctamente.';
      this.markFormGroupTouched(this.form);
    }
  }

  init(): void {
    if (this.edicion) {
      this.adS.listId(this.id).subscribe((data) => {
        this.form = new FormGroup({
          idAsignacion: new FormControl(data.idAsignacion),
          idDocente: new FormControl(data.idDocente),
          idCurso: new FormControl(data.idCurso),
          grado: new FormControl(data.grado),
          seccion: new FormControl(data.seccion),
          anioAcademico: new FormControl(data.anioAcademico)
        });
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  cancelar(): void {
    this.router.navigate(['components/asignaciones']);
  }
}