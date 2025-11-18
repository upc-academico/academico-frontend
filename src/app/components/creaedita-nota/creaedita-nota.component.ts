import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Nota } from 'src/app/models/Nota';
import { Estudiante } from 'src/app/models/Estudiante';
import { Competencia } from 'src/app/models/Competencia';
import { User } from 'src/app/models/User';
import { NotaService } from 'src/app/services/nota.service';
import { EstudianteService } from 'src/app/services/estudiante.service';
import { CompetenciaService } from 'src/app/services/competencia.service';
import { UsersService } from 'src/app/services/users.service';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-creaedita-nota',
  templateUrl: './creaedita-nota.component.html',
  styleUrls: ['./creaedita-nota.component.css']
})
export class CreaeditaNotaComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  nota: Nota = new Nota();
  mensaje: string = '';
  id: number = 0;
  edicion: boolean = false;
  isLoading: boolean = false;

  listaEstudiantes: Estudiante[] = [];
  listaCompetencias: Competencia[] = [];
  listaDocentes: User[] = [];

  // ⬇️ ACTUALIZADO: Calificaciones con letras
  calificaciones = [
    { value: 'AD', viewValue: 'AD - Logro Destacado', color: '#4caf50' },
    { value: 'A', viewValue: 'A - Logro Esperado', color: '#2196f3' },
    { value: 'B', viewValue: 'B - En Proceso', color: '#ff9800' },
    { value: 'C', viewValue: 'C - En Inicio', color: '#f44336' }
  ];

  periodos = [
    { value: 'Bimestre 1', viewValue: 'Bimestre 1' },
    { value: 'Bimestre 2', viewValue: 'Bimestre 2' },
    { value: 'Bimestre 3', viewValue: 'Bimestre 3' },
    { value: 'Bimestre 4', viewValue: 'Bimestre 4' },
    { value: 'Trimestre 1', viewValue: 'Trimestre 1' },
    { value: 'Trimestre 2', viewValue: 'Trimestre 2' },
    { value: 'Trimestre 3', viewValue: 'Trimestre 3' }
  ];

  currentUserRole: string = '';
  currentUserId: number = 0;

  constructor(
    private nS: NotaService,
    private eS: EstudianteService,
    private cS: CompetenciaService,
    private uS: UsersService,
    private loginService: LoginService,
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

    // Obtener rol y usuario actual
    this.currentUserRole = this.loginService.showRole();
    this.currentUserId = this.getUserIdFromToken();

    this.form = this.formBuilder.group({
      idNota: [''],
      idEstudiante: ['', Validators.required],
      idCompetencia: ['', Validators.required],
      idDocente: ['', Validators.required],
      calificacion: ['', Validators.required], // ⬅️ Ahora es string
      periodo: ['', Validators.required],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]],
      observacion: ['', Validators.maxLength(500)]
    });

    // Si es docente (USER), pre-seleccionar su ID
    if (this.currentUserRole === 'USER' && !this.edicion) {
      this.form.patchValue({ idDocente: this.currentUserId });
    }

    this.loadData();
  }

  getUserIdFromToken(): number {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  loadData(): void {
    this.eS.list().subscribe((data) => {
      this.listaEstudiantes = data;
    });

    this.cS.list().subscribe((data) => {
      this.listaCompetencias = data;
    });

    this.uS.list().subscribe((data) => {
      // Solo mostrar usuarios con rol ADMIN (docentes)
      this.listaDocentes = data.filter(u => u.role === 'ADMIN' || u.role === 'USER');
    });
  }

  aceptar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.mensaje = '';

      this.nota.idNota = this.form.value.idNota;
      this.nota.idEstudiante = this.form.value.idEstudiante;
      this.nota.idCompetencia = this.form.value.idCompetencia;
      this.nota.idDocente = this.form.value.idDocente;
      this.nota.calificacion = this.form.value.calificacion; // ⬅️ String
      this.nota.periodo = this.form.value.periodo;
      this.nota.anio = this.form.value.anio;
      this.nota.observacion = this.form.value.observacion;
      this.nota.enabled = true;

      const operation = this.edicion
        ? this.nS.update(this.nota)
        : this.nS.insert(this.nota);

      operation.pipe(
        switchMap(() => this.nS.list())
      ).subscribe({
        next: (data) => {
          this.nS.setList(data);
          this.isLoading = false;

          this.snackBar.open(
            this.edicion ? 'Nota actualizada exitosamente' : 'Nota registrada exitosamente',
            'Cerrar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );

          this.router.navigate(['components/notas']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error:', error);
          this.mensaje = 'Error al guardar la nota. Intente nuevamente.';

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
      this.nS.listId(this.id).subscribe((data) => {
        this.form = new FormGroup({
          idNota: new FormControl(data.idNota),
          idEstudiante: new FormControl(data.idEstudiante),
          idCompetencia: new FormControl(data.idCompetencia),
          idDocente: new FormControl(data.idDocente),
          calificacion: new FormControl(data.calificacion),
          periodo: new FormControl(data.periodo),
          anio: new FormControl(data.anio),
          observacion: new FormControl(data.observacion)
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
    this.router.navigate(['components/notas']);
  }

  // Método auxiliar para obtener color según calificación
  getCalificacionColor(calificacion: string): string {
    const cal = this.calificaciones.find(c => c.value === calificacion);
    return cal ? cal.color : '#757575';
  }
}