import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotaService } from 'src/app/services/nota.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-dashboard-grado',
  templateUrl: './dashboard-grado.component.html',
  styleUrls: ['./dashboard-grado.component.css']
})
export class DashboardGradoComponent implements OnInit {

  filterForm: FormGroup;
  isLoading: boolean = false;

  chartRendimiento: any;
  chartCompetencias: any;
  chartDistribucion: any;

  totalEstudiantes: number = 0;
  promedioGrado: number = 0;
  estudiantesRiesgo: number = 0;
  mejorPromedio: number = 0;

  periodos = [
    { value: 'Bimestre 1', viewValue: 'Bimestre 1' },
    { value: 'Bimestre 2', viewValue: 'Bimestre 2' },
    { value: 'Bimestre 3', viewValue: 'Bimestre 3' },
    { value: 'Bimestre 4', viewValue: 'Bimestre 4' }
  ];

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
    private fb: FormBuilder,
    private nS: NotaService
  ) {
    this.filterForm = this.fb.group({
      grado: ['Primero', Validators.required],
      seccion: ['A', Validators.required],
      periodo: ['Bimestre 1', Validators.required],
      anio: [new Date().getFullYear(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.generarReporte();
  }

  generarReporte(): void {
    if (this.filterForm.valid) {
      this.isLoading = true;
      const { grado, seccion, periodo, anio } = this.filterForm.value;

      this.nS.findByGradoSeccionPeriodo(grado, seccion, periodo, anio).subscribe({
        next: (data) => {
          this.calcularEstadisticas(data);
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

  calcularEstadisticas(notas: any[]): void {
    // Obtener estudiantes únicos
    const estudiantesUnicos = new Set(notas.map(n => n.idEstudiante));
    this.totalEstudiantes = estudiantesUnicos.size;

    // Calcular promedio del grado
    const calificaciones = notas.map(n => n.calificacion);
    this.promedioGrado = calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length;

    // Contar estudiantes en riesgo
    const estudiantesConRiesgo = new Set();
    notas.forEach(nota => {
      if (nota.calificacion < 11) {
        estudiantesConRiesgo.add(nota.idEstudiante);
      }
    });
    this.estudiantesRiesgo = estudiantesConRiesgo.size;

    // Mejor promedio
    this.mejorPromedio = Math.max(...calificaciones);
  }

  crearGraficos(notas: any[]): void {
    this.crearGraficoRendimiento(notas);
    this.crearGraficoCompetencias(notas);
    this.crearGraficoDistribucion(notas);
  }

  crearGraficoRendimiento(notas: any[]): void {
    // Agrupar por estudiante
    const estudiantesMap = new Map<number, { nombre: string, notas: number[] }>();

    notas.forEach(nota => {
      if (!estudiantesMap.has(nota.idEstudiante)) {
        estudiantesMap.set(nota.idEstudiante, {
          nombre: nota.nombreEstudiante,
          notas: []
        });
      }
      estudiantesMap.get(nota.idEstudiante)?.notas.push(nota.calificacion);
    });

    // Calcular promedios
    const labels: string[] = [];
    const promedios: number[] = [];

    estudiantesMap.forEach((value, key) => {
      labels.push(value.nombre);
      const promedio = value.notas.reduce((a, b) => a + b, 0) / value.notas.length;
      promedios.push(promedio);
    });

    const canvas = document.getElementById('chartRendimiento') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (this.chartRendimiento) {
      this.chartRendimiento.destroy();
    }

    if (ctx) {
      this.chartRendimiento = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Promedio por Estudiante',
            data: promedios,
            backgroundColor: promedios.map(p =>
              p < 11 ? 'rgba(244, 67, 54, 0.7)' :
                p < 14 ? 'rgba(255, 152, 0, 0.7)' :
                  p < 17 ? 'rgba(33, 150, 243, 0.7)' :
                    'rgba(76, 175, 80, 0.7)'
            ),
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
              text: 'Rendimiento por Estudiante',
              font: { size: 16, weight: 'bold' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 20,
              ticks: { stepSize: 2 }
            }
          }
        }
      });
    }
  }

  crearGraficoCompetencias(notas: any[]): void {
    const competenciasMap = new Map<string, number[]>();

    notas.forEach(nota => {
      if (!competenciasMap.has(nota.nombreCompetencia)) {
        competenciasMap.set(nota.nombreCompetencia, []);
      }
      competenciasMap.get(nota.nombreCompetencia)?.push(nota.calificacion);
    });

    const labels = Array.from(competenciasMap.keys());
    const promedios = Array.from(competenciasMap.values()).map(cals =>
      cals.reduce((a, b) => a + b, 0) / cals.length
    );

    const canvas = document.getElementById('chartCompetencias') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (this.chartCompetencias) {
      this.chartCompetencias.destroy();
    }

    if (ctx) {
      this.chartCompetencias = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Promedio por Competencia',
            data: promedios,
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: '#667eea',
            borderWidth: 3,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Rendimiento por Competencia',
              font: { size: 16, weight: 'bold' }
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 20,
              ticks: { stepSize: 4 }
            }
          }
        }
      });
    }
  }

  crearGraficoDistribucion(notas: any[]): void {
    const calificaciones = notas.map(n => n.calificacion);

    const enRiesgo = calificaciones.filter(c => c < 11).length;
    const regular = calificaciones.filter(c => c >= 11 && c < 14).length;
    const satisfactorio = calificaciones.filter(c => c >= 14 && c < 17).length;
    const destacado = calificaciones.filter(c => c >= 17).length;

    const canvas = document.getElementById('chartDistribucion') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (this.chartDistribucion) {
      this.chartDistribucion.destroy();
    }

    if (ctx) {
      this.chartDistribucion = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['En Riesgo', 'Regular', 'Satisfactorio', 'Destacado'],
          datasets: [{
            data: [enRiesgo, regular, satisfactorio, destacado],
            backgroundColor: [
              'rgba(244, 67, 54, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(33, 150, 243, 0.8)',
              'rgba(76, 175, 80, 0.8)'
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
              text: 'Distribución de Calificaciones',
              font: { size: 16, weight: 'bold' }
            }
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.chartRendimiento) this.chartRendimiento.destroy();
    if (this.chartCompetencias) this.chartCompetencias.destroy();
    if (this.chartDistribucion) this.chartDistribucion.destroy();
  }
}