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

  chart: any;
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
        this.cursosDocente = data;
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
    const secciones = this.cursosDocente
      .filter(a => a.idCurso === idCurso)
      .map(a => a.seccion);
    this.seccionesDocente = [...new Set(secciones)];
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
          this.crearGraficos(data);
          this.isLoading = false;
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

    if (this.chart) {
      this.chart.destroy();
    }

    if (ctx) {
      this.chart = new Chart(ctx, {
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
              ticks: { stepSize: 1 },
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

    if (ctx) {
      new Chart(ctx, {
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
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: {
              display: true,
              text: 'Proporción de Calificaciones',
              font: { size: 18, weight: 'bold' }
            }
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}