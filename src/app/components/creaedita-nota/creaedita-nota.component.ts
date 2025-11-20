import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Nota } from 'src/app/models/Nota';
import { Estudiante } from 'src/app/models/Estudiante';
import { Competencia } from 'src/app/models/Competencia';
import { Curso } from 'src/app/models/Curso';
import { User } from 'src/app/models/User';
import { NotaService } from 'src/app/services/nota.service';
import { EstudianteService } from 'src/app/services/estudiante.service';
import { CompetenciaService } from 'src/app/services/competencia.service';
import { CursoService } from 'src/app/services/curso.service';
import { AsignacionDocenteService } from 'src/app/services/asignacion-docente.service';
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
  listaCursos: Curso[] = [];
  
  // Listas filtradas
  estudiantesFiltrados: Estudiante[] = [];
  competenciasFiltradas: Competencia[] = [];
  
  // Listas de grados y secciones del docente
  gradosDocente: string[] = [];
  seccionesDocente: string[] = [];

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
    private cursoS: CursoService,
    private adS: AsignacionDocenteService,
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

    this.currentUserRole = this.loginService.showRole();
    this.currentUserId = this.getUserIdFromToken();

    this.form = this.formBuilder.group({
      idNota: [''],
      grado: ['', Validators.required],
      seccion: ['', Validators.required],
      idEstudiante: ['', Validators.required],
      periodo: ['', Validators.required],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]],
      idDocente: [{ value: '', disabled: true }, Validators.required],
      idCurso: ['', Validators.required],
      idCompetencia: ['', Validators.required],
      calificacion: ['', Validators.required],
      observacion: ['', Validators.maxLength(500)]
    });

    this.loadData();
    this.setupFormListeners();
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
    // Cargar todos los estudiantes
    this.eS.list().subscribe((data) => {
      this.listaEstudiantes = data;
    });

    // Cargar todas las competencias
    this.cS.list().subscribe((data) => {
      this.listaCompetencias = data;
    });

    // Cargar docentes
    this.uS.list().subscribe((data) => {
      this.listaDocentes = data.filter(u => u.role === 'ADMIN' || u.role === 'USER');
    });

    // Cargar asignaciones del docente y construir listas
    this.adS.findByDocente(this.currentUserId).subscribe((asignaciones) => {
      // Obtener grados únicos
      this.gradosDocente = [...new Set(asignaciones.map(a => a.grado))];
      
      // Cargar cursos del docente
      const cursoIds = [...new Set(asignaciones.map(a => a.idCurso))];
      this.cursoS.list().subscribe((cursos) => {
        this.listaCursos = cursos.filter(c => cursoIds.includes(c.idCurso));
      });

      // Pre-seleccionar docente si no es edición
      if (!this.edicion) {
        this.form.patchValue({ idDocente: this.currentUserId });
      }
    });
  }

  setupFormListeners(): void {
    // Listener para grado
    this.form.get('grado')?.valueChanges.subscribe(grado => {
      if (grado) {
        this.loadSeccionesPorGrado(grado);
      }
      this.form.patchValue({ seccion: '', idEstudiante: '' });
    });

    // Listener para sección
    this.form.get('seccion')?.valueChanges.subscribe(seccion => {
      const grado = this.form.get('grado')?.value;
      if (grado && seccion) {
        this.loadEstudiantesPorGradoSeccion(grado, seccion);
      }
    });

    // Listener para curso
    this.form.get('idCurso')?.valueChanges.subscribe(idCurso => {
      if (idCurso) {
        this.loadCompetenciasPorCurso(idCurso);
      }
      this.form.patchValue({ idCompetencia: '' });
    });
  }

  loadSeccionesPorGrado(grado: string): void {
    this.adS.findByDocente(this.currentUserId).subscribe((asignaciones) => {
      this.seccionesDocente = [...new Set(
        asignaciones
          .filter(a => a.grado === grado)
          .map(a => a.seccion)
      )];
    });
  }

  loadEstudiantesPorGradoSeccion(grado: string, seccion: string): void {
    this.estudiantesFiltrados = this.listaEstudiantes.filter(
      e => e.grado === grado && e.seccion === seccion
    );
  }

  loadCompetenciasPorCurso(idCurso: number): void {
    this.competenciasFiltradas = this.listaCompetencias.filter(
      c => c.curso.idCurso === idCurso
    );
  }

  aceptar(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.mensaje = '';

      // Obtener el valor del idDocente (aunque esté deshabilitado)
      const formValue = this.form.getRawValue();

      this.nota.idNota = formValue.idNota;
      this.nota.idEstudiante = formValue.idEstudiante;
      this.nota.idCompetencia = formValue.idCompetencia;
      this.nota.idDocente = formValue.idDocente;
      this.nota.calificacion = formValue.calificacion;
      this.nota.periodo = formValue.periodo;
      this.nota.anio = formValue.anio;
      this.nota.observacion = formValue.observacion;
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
          grado: new FormControl(''),
          seccion: new FormControl(''),
          idEstudiante: new FormControl(data.idEstudiante),
          periodo: new FormControl(data.periodo),
          anio: new FormControl(data.anio),
          idDocente: new FormControl({ value: data.idDocente, disabled: true }),
          idCurso: new FormControl(''),
          idCompetencia: new FormControl(data.idCompetencia),
          calificacion: new FormControl(data.calificacion),
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

  getCalificacionColor(calificacion: string): string {
    const cal = this.calificaciones.find(c => c.value === calificacion);
    return cal ? cal.color : '#757575';
  }
}