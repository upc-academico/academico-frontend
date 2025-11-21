import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotaService } from 'src/app/services/nota.service';
import { AsignacionDocenteService } from 'src/app/services/asignacion-docente.service';
import { CompetenciaService } from 'src/app/services/competencia.service';
import { LoginService } from 'src/app/services/login.service';
import { AsignacionDocente } from 'src/app/models/AsignacionDocente';
import { Competencia } from 'src/app/models/Competencia';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-distribucion-calificaciones',
  templateUrl: './distribucion-calificaciones.component.html',
  styleUrls: ['./distribucion-calificaciones.component.css']
})
export class DistribucionCalificacionesComponent implements OnInit {

  filterForm: FormGroup;
  isLoading: boolean = false;
  currentUserId: number = 0;

  cursosDocente: AsignacionDocente[] = [];
  competenciasCurso: Competencia[] = [];
  seccionesDocente: string[] = [];

  chartBarras: any;
  chartTorta: any;
  distribucionData: any = null;

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

  generarGrafico(): void {
    if (this.filterForm.valid) {
      this.isLoading = true;
      const { idCurso, idCompetencia, seccion, periodo, anio } = this.filterForm.value;

      this.nS.getDistribucionCalificaciones(
        this.currentUserId,
        idCompetencia,
        seccion,
        periodo,
        anio
      ).subscribe({
        next: (data) => {
          this.distribucionData = data;
          this.isLoading = false;

          // ⬇️ AGREGAR TIMEOUT PARA ESPERAR RENDERIZADO DEL DOM
          setTimeout(() => {
            this.crearGraficos(data);
          }, 0);
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  crearGraficos(data: any): void {
    this.crearGraficoBarras(data);
    this.crearGraficoTorta(data);
  }

  crearGraficoBarras(data: any): void {
    const canvas = document.getElementById('chartBarras') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (this.chartBarras) {
      this.chartBarras.destroy();
    }

    if (ctx) {
      this.chartBarras = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['AD - Logro Destacado', 'A - Logro Esperado', 'B - En Proceso', 'C - En Inicio'],
          datasets: [{
            label: 'Cantidad de Estudiantes',
            data: [data.AD || 0, data.A || 0, data.B || 0, data.C || 0],
            backgroundColor: [
              'rgba(76, 175, 80, 0.8)',
              'rgba(33, 150, 243, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(244, 67, 54, 0.8)'
            ],
            borderColor: [
              '#4caf50',
              '#2196f3',
              '#ff9800',
              '#f44336'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Distribución de Calificaciones por Nivel',
              font: { size: 18, weight: 'bold' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0
              },
              title: {
                display: true,
                text: 'Cantidad de Estudiantes'
              }
            }
          }
        }
      });
    }
  }

  crearGraficoTorta(data: any): void {
    const canvas = document.getElementById('chartTorta') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (this.chartTorta) {
      this.chartTorta.destroy();
    }

    const total = (data.AD || 0) + (data.A || 0) + (data.B || 0) + (data.C || 0);

    if (ctx && total > 0) {
      this.chartTorta = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['AD', 'A', 'B', 'C'],
          datasets: [{
            data: [data.AD || 0, data.A || 0, data.B || 0, data.C || 0],
            backgroundColor: [
              'rgba(76, 175, 80, 0.8)',
              'rgba(33, 150, 243, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(244, 67, 54, 0.8)'
            ],
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 14
                }
              }
            },
            title: {
              display: true,
              text: 'Proporción de Calificaciones',
              font: { size: 18, weight: 'bold' }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} estudiantes (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  getTotalEstudiantes(): number {
    if (!this.distribucionData) return 0;
    return (this.distribucionData.AD || 0) +
      (this.distribucionData.A || 0) +
      (this.distribucionData.B || 0) +
      (this.distribucionData.C || 0);
  }

  getPorcentaje(valor: number): string {
    const total = this.getTotalEstudiantes();
    if (total === 0) return '0';
    return ((valor / total) * 100).toFixed(1);
  }

  ngOnDestroy(): void {
    if (this.chartBarras) {
      this.chartBarras.destroy();
    }
    if (this.chartTorta) {
      this.chartTorta.destroy();
    }
  }
}