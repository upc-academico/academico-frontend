import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotaService } from 'src/app/services/nota.service';
import { EstudianteService } from 'src/app/services/estudiante.service';
import { AsignacionDocenteService } from 'src/app/services/asignacion-docente.service';
import { CompetenciaService } from 'src/app/services/competencia.service';
import { LoginService } from 'src/app/services/login.service';
import { Estudiante } from 'src/app/models/Estudiante';
import { AsignacionDocente } from 'src/app/models/AsignacionDocente';
import { Competencia } from 'src/app/models/Competencia';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-evolucion-competencia',
  templateUrl: './evolucion-competencia.component.html',
  styleUrls: ['./evolucion-competencia.component.css']
})
export class EvolucionCompetenciaComponent implements OnInit {

  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  filterForm: FormGroup;
  isLoading: boolean = false;
  currentUserId: number = 0;

  cursosDocente: AsignacionDocente[] = [];
  competenciasCurso: Competencia[] = [];
  estudiantesCurso: Estudiante[] = [];

  chart: any;
  datosEvolucion: any[] = [];

  // Información del estudiante seleccionado
  nombreEstudiante: string = '';
  nombreCompetencia: string = '';
  tendencia: string = '';
  promedioGeneral: string = '';

  constructor(
    private fb: FormBuilder,
    private nS: NotaService,
    private eS: EstudianteService,
    private adS: AsignacionDocenteService,
    private cS: CompetenciaService,
    private loginService: LoginService
  ) {
    this.filterForm = this.fb.group({
      idCurso: ['', Validators.required],
      idCompetencia: ['', Validators.required],
      idEstudiante: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.getUserIdFromToken();
    this.loadAsignacionesDocente();

    // Escuchar cambios en el curso seleccionado
    this.filterForm.get('idCurso')?.valueChanges.subscribe(idCurso => {
      if (idCurso) {
        this.loadCompetenciasPorCurso(idCurso);
        this.loadEstudiantesPorCurso(idCurso);
      }
      this.filterForm.patchValue({ 
        idCompetencia: '', 
        idEstudiante: '' 
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

  loadEstudiantesPorCurso(idCurso: number): void {
    // Obtener las secciones que dicta el docente para este curso
    this.adS.findByDocente(this.currentUserId).subscribe({
      next: (asignaciones) => {
        const seccionesDocente = asignaciones
          .filter(a => a.idCurso === idCurso)
          .map(a => ({ grado: a.grado, seccion: a.seccion }));

        this.eS.list().subscribe({
          next: (data) => {
            // Filtrar estudiantes que pertenecen a las secciones del docente
            this.estudiantesCurso = data.filter(estudiante =>
              seccionesDocente.some(s =>
                s.grado === estudiante.grado && s.seccion === estudiante.seccion
              )
            );
          },
          error: (error) => console.error('Error:', error)
        });
      },
      error: (error) => console.error('Error:', error)
    });
  }

  generarGrafico(): void {
    if (this.filterForm.valid) {
      this.isLoading = true;
      const { idEstudiante, idCompetencia } = this.filterForm.value;

      // Obtener nombres para el título
      const estudiante = this.estudiantesCurso.find(e => e.idEstudiante === idEstudiante);
      const competencia = this.competenciasCurso.find(c => c.idCompetencia === idCompetencia);

      this.nombreEstudiante = estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : '';
      this.nombreCompetencia = competencia ? competencia.nombreCompetencia.toString() : '';

      this.nS.getEvolucionPorCompetencia(idEstudiante, idCompetencia).subscribe({
        next: (data) => {
          this.datosEvolucion = data;
          this.calcularEstadisticas(data);
          this.crearGraficoEvolucion(data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  calcularEstadisticas(datos: any[]): void {
    if (datos.length === 0) return;

    // Calcular promedio (convertir letras a números para promediar)
    const valores = datos.map(d => this.calificacionANumero(d.calificacion));
    const suma = valores.reduce((a, b) => a + b, 0);
    const promedio = suma / valores.length;
    this.promedioGeneral = this.numeroACalificacion(promedio);

    // Calcular tendencia
    if (datos.length >= 2) {
      const ultimasTres = valores.slice(-3);
      const primerasTres = valores.slice(0, Math.min(3, valores.length));
      const promedioReciente = ultimasTres.reduce((a, b) => a + b, 0) / ultimasTres.length;
      const promedioAntiguo = primerasTres.reduce((a, b) => a + b, 0) / primerasTres.length;

      if (promedioReciente > promedioAntiguo + 0.5) {
        this.tendencia = 'mejora';
      } else if (promedioReciente < promedioAntiguo - 0.5) {
        this.tendencia = 'retroceso';
      } else {
        this.tendencia = 'estable';
      }
    }
  }

  calificacionANumero(calificacion: string): number {
    const conversion: { [key: string]: number } = {
      'C': 1,
      'B': 2,
      'A': 3,
      'AD': 4
    };
    return conversion[calificacion] || 0;
  }

  numeroACalificacion(numero: number): string {
    if (numero >= 3.5) return 'AD';
    if (numero >= 2.5) return 'A';
    if (numero >= 1.5) return 'B';
    return 'C';
  }

 crearGraficoEvolucion(datos: any[]): void {
  const canvas = document.getElementById('chartEvolucion') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');

  if (this.chart) {
    this.chart.destroy();
  }

  const labels = datos.map(d => `${d.periodo} ${d.anio}`);
  const calificaciones = datos.map(d => this.calificacionANumero(d.calificacion));
  const colores = datos.map(d => this.getColorPorCalificacion(d.calificacion));

  if (ctx) {
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nivel de Logro',
          data: calificaciones,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 8,
          pointBackgroundColor: colores,
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointHoverRadius: 10
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
            text: `Evolución de ${this.nombreEstudiante}`,
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const valor = context.parsed.y;
                // ⬇️ CORRECCIÓN: Verificar si el valor no es null
                if (valor === null || valor === undefined) {
                  return 'Sin datos';
                }
                const letra = this.numeroACalificacion(valor);
                return `Nivel: ${letra} (${this.getNombreNivel(letra)})`;
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 4,
            ticks: {
              stepSize: 1,
              callback: (value) => {
                const niveles = ['', 'C', 'B', 'A', 'AD'];
                const index = typeof value === 'number' ? value : 0;
                return niveles[index];
              }
            },
            title: {
              display: true,
              text: 'Nivel de Logro'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Periodo Académico'
            }
          }
        }
      }
    });
  }
}

  getColorPorCalificacion(calificacion: string): string {
    const colores: { [key: string]: string } = {
      'AD': '#4caf50',
      'A': '#2196f3',
      'B': '#ff9800',
      'C': '#f44336'
    };
    return colores[calificacion] || '#999';
  }

  getNombreNivel(calificacion: string): string {
    const nombres: { [key: string]: string } = {
      'AD': 'Logro Destacado',
      'A': 'Logro Esperado',
      'B': 'En Proceso',
      'C': 'En Inicio'
    };
    return nombres[calificacion] || '';
  }

  getTendenciaIcon(): string {
    switch (this.tendencia) {
      case 'mejora': return 'trending_up';
      case 'retroceso': return 'trending_down';
      case 'estable': return 'trending_flat';
      default: return 'remove';
    }
  }

  getTendenciaClass(): string {
    switch (this.tendencia) {
      case 'mejora': return 'tendencia-mejora';
      case 'retroceso': return 'tendencia-retroceso';
      case 'estable': return 'tendencia-estable';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}