import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NotaService } from 'src/app/services/nota.service';
import { AsignacionDocenteService } from 'src/app/services/asignacion-docente.service';
import { CompetenciaService } from 'src/app/services/competencia.service';
import { LoginService } from 'src/app/services/login.service';
import { Nota } from 'src/app/models/Nota';
import { AsignacionDocente } from 'src/app/models/AsignacionDocente';
import { Competencia } from 'src/app/models/Competencia';

@Component({
  selector: 'app-filtro-notas',
  templateUrl: './filtro-notas.component.html',
  styleUrls: ['./filtro-notas.component.css']
})
export class FiltroNotasComponent implements OnInit {

  filterForm: FormGroup;
  dataSource: MatTableDataSource<Nota> = new MatTableDataSource();
  isLoading: boolean = false;

  currentUserId: number = 0;
  cursosDocente: AsignacionDocente[] = [];
  competenciasCurso: Competencia[] = [];
  seccionesDocente: string[] = [];

  displayedColumns: string[] = [
    'estudiante',
    'competencia',
    'calificacion',
    'observacion'
  ];

  periodos = [
    { value: 'Bimestre 1', viewValue: 'Bimestre 1' },
    { value: 'Bimestre 2', viewValue: 'Bimestre 2' },
    { value: 'Bimestre 3', viewValue: 'Bimestre 3' },
    { value: 'Bimestre 4', viewValue: 'Bimestre 4' }
  ];

  constructor(
    private fb: FormBuilder,
    private nS: NotaService,
    private adS: AsignacionDocenteService,
    private cS: CompetenciaService,
    private loginService: LoginService
  ) {
    this.filterForm = this.fb.group({
      idCurso: ['', Validators.required],
      idCompetencia: ['', Validators.required],
      seccion: ['', Validators.required],
      periodo: ['Bimestre 1', Validators.required],
      anio: [new Date().getFullYear(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.getUserIdFromToken();
    this.loadAsignacionesDocente();

    // Escuchar cambios en el curso seleccionado
    this.filterForm.get('idCurso')?.valueChanges.subscribe(idCurso => {
      if (idCurso) {
        this.loadCompetenciasPorCurso(idCurso);
        this.loadSeccionesPorCurso(idCurso);
      }
    });
  }

  getUserIdFromToken(): number {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || 0;
      } catch (error) {
        console.error('❌ Error decodificando token:', error);
        return 0;
      }
    }
    return 0;
  }

  loadAsignacionesDocente(): void {
    console.log('🔍 Buscando asignaciones para docente ID:', this.currentUserId);

    this.adS.findByDocente(this.currentUserId).subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos:', data);
        console.log('📊 Cantidad:', data.length);
        console.log('📝 Primer curso:', data[0]);
        this.cursosDocente = data;
      },
      error: (error) => {
        console.error('❌ Error:', error);
      }
    });
  }

  loadCompetenciasPorCurso(idCurso: number): void {
    this.cS.list().subscribe({
      next: (data) => {
        this.competenciasCurso = data.filter(c => c.curso.idCurso === idCurso);
      },
      error: (error) => console.error('Error:', error)
    });
  }

  loadSeccionesPorCurso(idCurso: number): void {
    const secciones = this.cursosDocente
      .filter(a => a.idCurso === idCurso)
      .map(a => a.seccion);
    this.seccionesDocente = [...new Set(secciones)];
  }

  buscarNotas(): void {
    if (this.filterForm.valid) {
      this.isLoading = true;
      const { idCurso, idCompetencia, seccion, periodo, anio } = this.filterForm.value;

      this.nS.findByDocenteCompetenciaSeccion(
        this.currentUserId,
        idCurso,
        idCompetencia,
        seccion,
        periodo,
        anio
      ).subscribe({
        next: (data) => {
          // ⬇️ CORRECCIÓN: Ordenar por calificación (C, B, A, AD)
          const ordenCalificacion: { [key: string]: number } = {
            'C': 1,
            'B': 2,
            'A': 3,
            'AD': 4
          };

          data.sort((a, b) => {
            const valorA = ordenCalificacion[a.calificacion] || 0;
            const valorB = ordenCalificacion[b.calificacion] || 0;
            return valorA - valorB;
          });

          this.dataSource = new MatTableDataSource(data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getCalificacionClass(calificacion: string): string {
    const classes: { [key: string]: string } = {
      'AD': 'cal-ad',
      'A': 'cal-a',
      'B': 'cal-b',
      'C': 'cal-c'
    };
    return classes[calificacion] || '';
  }
}