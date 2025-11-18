import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Curso } from 'src/app/models/Curso';
import { CursoService } from 'src/app/services/curso.service';

@Component({
  selector: 'app-creaedita',
  templateUrl: './creaedita.component.html',
  styleUrls: ['./creaedita.component.css']
})
export class CreaeditaComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  curso: Curso = new Curso();
  mensaje: string = '';
  id: number = 0;
  edicion: boolean = false;

  constructor(
    private cS: CursoService,
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
      idCurso: [''],
      nombreCurso: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    });
  }

  aceptar(): void {
    if (this.form.valid) {
      this.curso.idCurso = this.form.value.idCurso;
      this.curso.nombreCurso = this.form.value.nombreCurso.trim();
      this.curso.enabled = false;

      if (this.edicion) {
        this.actualizarCurso();
      } else {
        this.insertarCurso();
      }
    } else {
      this.mensaje = 'Por favor complete todos los campos correctamente.';
      this.marcarCamposComoTocados();
    }
  }

  insertarCurso(): void {
    this.cS.insert(this.curso).subscribe({
      next: () => {
        this.mostrarMensaje('Curso registrado exitosamente', 'success');
        this.cS.list().subscribe((data) => {
          this.cS.setList(data);
        });
        this.router.navigate(['components/cursos']);
      },
      error: (error) => {
        this.mostrarMensaje('Error al registrar el curso', 'error');
        console.error('Error:', error);
      }
    });
  }

  actualizarCurso(): void {
    this.cS.update(this.curso).subscribe({
      next: () => {
        this.mostrarMensaje('Curso actualizado exitosamente', 'success');
        this.cS.list().subscribe((data) => {
          this.cS.setList(data);
        });
        this.router.navigate(['components/cursos']);
      },
      error: (error) => {
        this.mostrarMensaje('Error al actualizar el curso', 'error');
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
      this.cS.listId(this.id).subscribe({
        next: (data) => {
          this.form = new FormGroup({
            idCurso: new FormControl(data.idCurso),
            nombreCurso: new FormControl(data.nombreCurso, [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(100)
            ]),
            enabled: new FormControl(data.enabled),
          });
        },
        error: (error) => {
          this.mostrarMensaje('Error al cargar el curso', 'error');
          this.router.navigate(['components/cursos']);
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