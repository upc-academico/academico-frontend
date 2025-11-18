import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotaService } from 'src/app/services/nota.service';
import { EstudianteService } from 'src/app/services/estudiante.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-evolucion-estudiante',
  templateUrl: './evolucion-estudiante.component.html',
  styleUrls: ['./evolucion-estudiante.component.css']
})
export class EvolucionEstudianteComponent implements OnInit {

  idEstudiante: number = 0;
  nombreEstudiante: string = '';
  isLoading: boolean = true;

  chartEvolucion: any;
  chartCompetencias: any;

  promedioGeneral: number = 0;
  totalNotas: number = 0;
  mejorNota: number = 0;
  peorNota: number = 0;
  tendencia: string = '';

  constructor(
    private route: ActivatedRoute,
    private nS: NotaService,
    private eS: EstudianteService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
      this.loadEstudiante();
      this.loadEvolucion();
    });
  }

  loadEstudiante(): void {
    this.eS.listId(this.idEstudiante).subscribe({
      next: (data) => {
        this.nombreEstudiante = `${data.nombres} ${data.apellidos}`;
      },
      error: (error) => console.error('Error:', error)
    });
  }

  loadEvolucion(): void {
    this.nS.getEvolucionEstudiante(this.idEstudiante).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.calcularEstadisticas(data);
          this.crearGraficoEvolucion(data);
          this.crearGraficoCompetencias(data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }

  calcularEstadisticas(notas: any[]): void {
    this.totalNotas = notas.length;

    const calificaciones = notas.map(n => n.calificacion);
    this.promedioGeneral = calificaciones.reduce((a, b) => a + b, 0) / this.totalNotas;
    this.mejorNota = Math.max(...calificaciones);
    this.peorNota = Math.min(...calificaciones);

    // Calcular tendencia
    if (notas.length >= 2) {
      const ultimasTres = calificaciones.slice(-3);
      const primerasTres = calificaciones.slice(0, 3);
      const promedioReciente = ultimasTres.reduce((a, b) => a + b, 0) / ultimasTres.length;
      const promedioAntiguo = primerasTres.reduce((a, b) => a + b, 0) / primerasTres.length;

      if (promedioReciente > promedioAntiguo + 1) {
        this.tendencia = 'mejora';
      } else if (promedioReciente < promedioAntiguo - 1) {
        this.tendencia = 'retroceso';
      } else {
        this.tendencia = 'estable';
      }
    }
  }

  crearGraficoEvolucion(notas: any[]): void {
    const labels = notas.map(n => `${n.periodo} ${n.anio}`);
    const data = notas.map(n => n.calificacion);

    const canvas = document.getElementById('chartEvolucion') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      this.chartEvolucion = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Calificaciones',
            data: data,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 8
          },
          {
            label: 'Línea de Aprobación (11)',
            data: Array(labels.length).fill(11),
            borderColor: '#ff9800',
            borderWidth: 2,
            borderDash: [10, 5],
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            title: {
              display: true,
              text: 'Evolución de Calificaciones en el Tiempo',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `Nota: ${context.parsed.y}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 20,
              ticks: {
                stepSize: 2
              },
              title: {
                display: true,
                text: 'Calificación'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Periodo'
              }
            }
          }
        }
      });
    }
  }

  crearGraficoCompetencias(notas: any[]): void {
    // Agrupar por competencia
    const competenciasMap = new Map<string, number[]>();

    notas.forEach(nota => {
      if (!competenciasMap.has(nota.nombreCompetencia)) {
        competenciasMap.set(nota.nombreCompetencia, []);
      }
      competenciasMap.get(nota.nombreCompetencia)?.push(nota.calificacion);
    });

    const labels = Array.from(competenciasMap.keys());
    const promedios = Array.from(competenciasMap.values()).map(calificaciones =>
      calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length
    );

    const backgroundColors = promedios.map(promedio => {
      if (promedio < 11) return 'rgba(244, 67, 54, 0.7)';
      if (promedio < 14) return 'rgba(255, 152, 0, 0.7)';
      if (promedio < 17) return 'rgba(33, 150, 243, 0.7)';
      return 'rgba(76, 175, 80, 0.7)';
    });

    const canvas = document.getElementById('chartCompetencias') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      this.chartCompetencias = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Promedio por Competencia',
            data: promedios,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Rendimiento por Competencia',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            tooltip: {
              callbacks: {
                // label: function (context) {
                //   return `Promedio: ${context.parsed.y.toFixed(2)}`;
                // }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 20,
              ticks: {
                stepSize: 2
              },
              title: {
                display: true,
                text: 'Promedio'
              }
            },
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.chartEvolucion) {
      this.chartEvolucion.destroy();
    }
    if (this.chartCompetencias) {
      this.chartCompetencias.destroy();
    }
  }
}