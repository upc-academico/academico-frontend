import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Estudiante } from 'src/app/models/Estudiante';
import { EstudianteService } from 'src/app/services/estudiante.service';

@Component({
  selector: 'app-creaedita-estudiante',
  templateUrl: './creaedita-estudiante.component.html',
  styleUrls: ['./creaedita-estudiante.component.css']
})
export class CreaeditaEstudianteComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  estudiante: Estudiante = new Estudiante();
  mensaje: string = '';
  id: number = 0;
  edicion: boolean = false;

  grados: { value: string; viewValue: string; icon: string }[] = [
    { value: 'Primero', viewValue: 'Primero', icon: 'looks_one' },
    { value: 'Segundo', viewValue: 'Segundo', icon: 'looks_two' },
    { value: 'Tercero', viewValue: 'Tercero', icon: 'looks_3' },
    { value: 'Cuarto', viewValue: 'Cuarto', icon: 'looks_4' },
    { value: 'Quinto', viewValue: 'Quinto', icon: 'looks_5' },
  ];

  secciones: { value: string; viewValue: string }[] = [
    { value: 'A', viewValue: 'Sección A' },
    { value: 'B', viewValue: 'Sección B' },
    { value: 'C', viewValue: 'Sección C' },
    { value: 'D', viewValue: 'Sección D' },
    { value: 'E', viewValue: 'Sección E' },
  ];

  constructor(
    private eS: EstudianteService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((data: Params) => {
      this.id = data['id'];
      this.edicion = data['id'] != null;
      this.init();
    });

    this.form = this.formBuilder.group({
      idEstudiante: [''],
      dni: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/),
        Validators.minLength(8),
        Validators.maxLength(8)
      ]],
      nombres: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      apellidos: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      grado: ['', Validators.required],
      seccion: ['', Validators.required],
    });
  }

  aceptar(): void {
    if (this.form.valid) {
      this.estudiante.idEstudiante = this.form.value.idEstudiante;
      this.estudiante.dni = this.form.value.dni.trim();
      this.estudiante.nombres = this.form.value.nombres.trim();
      this.estudiante.apellidos = this.form.value.apellidos.trim();
      this.estudiante.grado = this.form.value.grado;
      this.estudiante.seccion = this.form.value.seccion;
      this.estudiante.enabled = true;

      if (this.edicion) {
        this.actualizarEstudiante();
      } else {
        this.insertarEstudiante();
      }
    } else {
      this.mensaje = 'Por favor complete todos los campos correctamente.';
      this.marcarCamposComoTocados();
    }
  }

  insertarEstudiante(): void {
    this.eS.insert(this.estudiante).subscribe({
      next: () => {
        this.mostrarMensaje('Estudiante registrado exitosamente', 'success');
        this.eS.list().subscribe((data) => {
          this.eS.setList(data);
        });
        this.router.navigate(['components/estudiantes']);
      },
      error: (error) => {
        this.mostrarMensaje('Error al registrar el estudiante', 'error');
        console.error('Error:', error);
      }
    });
  }

  actualizarEstudiante(): void {
    this.eS.update(this.estudiante).subscribe({
      next: () => {
        this.mostrarMensaje('Estudiante actualizado exitosamente', 'success');
        this.eS.list().subscribe((data) => {
          this.eS.setList(data);
        });
        this.router.navigate(['components/estudiantes']);
      },
      error: (error) => {
        this.mostrarMensaje('Error al actualizar el estudiante', 'error');
        console.error('Error:', error);
      }
    });
  }

  obtenerControlCampo(nombreCampo: string): AbstractControl {
    const control = this.form.get(nombreCampo);
    if (!control) {
      throw new Error(`Control no encontrado para el campo ${nombreCampo}`);
    }
    return control;
  }

  init(): void {
    if (this.edicion) {
      this.eS.listId(this.id).subscribe({
        next: (data) => {
          this.form = new FormGroup({
            idEstudiante: new FormControl(data.idEstudiante),
            dni: new FormControl(data.dni, [
              Validators.required,
              Validators.pattern(/^[0-9]{8}$/),
              Validators.minLength(8),
              Validators.maxLength(8)
            ]),
            nombres: new FormControl(data.nombres, [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(50)
            ]),
            apellidos: new FormControl(data.apellidos, [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(50)
            ]),
            grado: new FormControl(data.grado, Validators.required),
            seccion: new FormControl(data.seccion, Validators.required),
            enabled: new FormControl(data.enabled),
          });
        },
        error: (error) => {
          this.mostrarMensaje('Error al cargar el estudiante', 'error');
          this.router.navigate(['components/estudiantes']);
        }
      });
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.form.controls).forEach(campo => {
      const control = this.form.get(campo);
      control?.markAsTouched();
    });
  }

  mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: tipo === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}