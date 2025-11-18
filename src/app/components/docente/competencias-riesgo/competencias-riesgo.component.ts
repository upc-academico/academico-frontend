import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotaService } from 'src/app/services/nota.service';
import { AsignacionDocenteService } from 'src/app/services/asignacion-docente.service';
import { LoginService } from 'src/app/services/login.service';
import { AsignacionDocente } from 'src/app/models/AsignacionDocente';
import { MatTableDataSource } from '@angular/material/table';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-competencias-riesgo',
  templateUrl: './competencias-riesgo.component.html',
  styleUrls: ['./competencias-riesgo.component.css']
})
export class CompetenciasRiesgoComponent implements OnInit {

  filterForm: FormGroup;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  isLoading: boolean = false;
  currentUserId: number = 0;

  cursosDocente: AsignacionDocente[] = [];
  seccionesDocente: string[] = [];

  chart: any;

  displayedColumns: string[] = [
    'competencia',
    'ad',
    'a',
    'b',
    'c',
    'total',
    'riesgo'
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
    private loginService: LoginService
  ) {
    this.filterForm = this.fb.group({
      idCurso: ['', Validators.required],
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

  loadSeccionesPorCurso(idCurso: number): void {
    const secciones = this.cursosDocente
      .filter(a => a.idCurso === idCurso)
      .map(a => a.seccion);
    this.seccionesDocente = [...new Set(secciones)];
  }

  analizarCompetencias(): void {
    if (this.filterForm.valid) {
      this.isLoading = true;
      const { idCurso, seccion, periodo, anio } = this.filterForm.value;

      this.nS.getCompetenciasConRiesgo(
        this.currentUserId,
        idCurso,
        seccion,
        periodo,
        anio
      ).subscribe({
        next: (data) => {
          // Agregar campo total y porcentaje de riesgo
          const processedData = data.map(comp => ({
            ...comp,
            total: (comp.AD || 0) + (comp.A || 0) + (comp.B || 0) + (comp.C || 0),
            porcentajeRiesgo: this.calcularPorcentajeRiesgo(comp)
          }));

          this.dataSource = new MatTableDataSource(processedData);
          this.crearGrafico(processedData);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  calcularPorcentajeRiesgo(comp: any): number {
    const total = (comp.AD || 0) + (comp.A || 0) + (comp.B || 0) + (comp.C || 0);
    if (total === 0) return 0;
    return Math.round(((comp.C || 0) / total) * 100);
  }

  getNivelRiesgo(porcentaje: number): string {
    if (porcentaje >= 50) return 'critico';
    if (porcentaje >= 30) return 'alto';
    if (porcentaje >= 15) return 'medio';
    return 'bajo';
  }

  crearGrafico(data: any[]): void {
    const canvas = document.getElementById('chartCompetencias') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (this.chart) {
      this.chart.destroy();
    }

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(c => c.nombreCompetencia),
          datasets: [
            {
              label: 'AD',
              data: data.map(c => c.AD || 0),
              backgroundColor: 'rgba(76, 175, 80, 0.8)',
              borderColor: '#4caf50',
              borderWidth: 2
            },
            {
              label: 'A',
              data: data.map(c => c.A || 0),
              backgroundColor: 'rgba(33, 150, 243, 0.8)',
              borderColor: '#2196f3',
              borderWidth: 2
            },
            {
              label: 'B',
              data: data.map(c => c.B || 0),
              backgroundColor: 'rgba(255, 152, 0, 0.8)',
              borderColor: '#ff9800',
              borderWidth: 2
            },
            {
              label: 'C',
              data: data.map(c => c.C || 0),
              backgroundColor: 'rgba(244, 67, 54, 0.8)',
              borderColor: '#f44336',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            title: {
              display: true,
              text: 'Distribución de Calificaciones por Competencia',
              font: { size: 18, weight: 'bold' }
            }
          },
          scales: {
            x: {
              stacked: false,
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              stacked: false,
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

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}