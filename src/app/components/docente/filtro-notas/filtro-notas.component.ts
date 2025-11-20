import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading: boolean = false;
  hasSearched: boolean = false;

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

    // Listener para cambios en curso
    this.filterForm.get('idCurso')?.valueChanges.subscribe(idCurso => {
      if (idCurso) {
        this.loadCompetenciasPorCurso(idCurso);
        this.loadSeccionesPorCurso(idCurso);
      }
      this.filterForm.patchValue({ 
        idCompetencia: '', 
        seccion: '' 
      });
    });
  }

  getUserIdFromToken(): number {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || 0;
      } catch (error) {
        console.error('Error decodificando token:', error);
        return 0;
      }
    }
    return 0;
  }

  loadAsignacionesDocente(): void {
    this.adS.findByDocente(this.currentUserId).subscribe({
      next: (data) => {
        // Eliminar duplicados de cursos
        const cursosUnicos = new Map<number, AsignacionDocente>();
        data.forEach(asignacion => {
          if (!cursosUnicos.has(asignacion.idCurso)) {
            cursosUnicos.set(asignacion.idCurso, asignacion);
          }
        });
        this.cursosDocente = Array.from(cursosUnicos.values());
      },
      error: (error) => console.error('Error:', error)
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
    this.adS.findByDocente(this.currentUserId).subscribe({
      next: (data) => {
        const secciones = data
          .filter(a => a.idCurso === idCurso)
          .map(a => a.seccion);
        this.seccionesDocente = [...new Set(secciones)];
      },
      error: (error) => console.error('Error:', error)
    });
  }

  buscarNotas(): void {
    if (this.filterForm.valid) {
      this.isLoading = true;
      this.hasSearched = true;
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
          // Ordenar por calificación (C, B, A, AD)
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
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          
          // Configurar filtro de búsqueda
          this.dataSource.filterPredicate = (data: Nota, filter: string) => {
            const searchStr = filter.toLowerCase();
            return data.nombreEstudiante.toLowerCase().includes(searchStr) ||
                   data.nombreCompetencia.toLowerCase().includes(searchStr) ||
                   data.calificacion.toLowerCase().includes(searchStr);
          };
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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

  limpiarFiltros(): void {
    this.filterForm.reset({
      periodo: 'Bimestre 1',
      anio: new Date().getFullYear()
    });
    this.dataSource = new MatTableDataSource();
    this.hasSearched = false;
  }

  exportarExcel(): void {
    console.log('Exportar Excel');
  }
}