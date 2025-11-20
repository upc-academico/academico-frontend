import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotaService } from 'src/app/services/nota.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

interface EstudianteRiesgo {
  idEstudiante: number;
  nombreEstudiante: string;
  grado: string;
  seccion: string;
  competenciasEnC: number;
}

@Component({
  selector: 'app-panel-riesgo',
  templateUrl: './panel-riesgo.component.html',
  styleUrls: ['./panel-riesgo.component.css']
})
export class PanelRiesgoComponent implements OnInit {

  filterForm: FormGroup;
  dataSource: MatTableDataSource<EstudianteRiesgo> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading: boolean = false;
  totalEnRiesgo: number = 0;

  displayedColumns: string[] = [
    'alerta',
    'estudiante',
    'grado',
    'seccion',
    'competenciasEnC',
    'acciones'
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
    private nS: NotaService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      periodo: ['Bimestre 1', Validators.required],
      anio: [new Date().getFullYear(), Validators.required],
      grado: [''],
      seccion: ['']
    });
  }

  ngOnInit(): void {
    this.buscarEstudiantesEnRiesgo();
  }

  buscarEstudiantesEnRiesgo(): void {
    if (this.filterForm.valid) {
      this.isLoading = true;
      const { periodo, anio, grado, seccion } = this.filterForm.value;

      this.nS.findEstudiantesConRiesgoAcademico(periodo, anio).subscribe({
        next: (data) => {
          // Filtrar por grado y sección si están seleccionados
          let filteredData = data;

          if (grado) {
            filteredData = filteredData.filter(e => e.grado === grado);
          }

          if (seccion) {
            filteredData = filteredData.filter(e => e.seccion === seccion);
          }

          this.dataSource = new MatTableDataSource(filteredData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          
          this.totalEnRiesgo = filteredData.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
    }
  }

  getNivelRiesgo(competenciasEnC: number): string {
    if (competenciasEnC >= 4) return 'critico';
    if (competenciasEnC >= 3) return 'alto';
    return 'medio';
  }

  getIconoAlerta(competenciasEnC: number): string {
    if (competenciasEnC >= 4) return 'error';
    if (competenciasEnC >= 3) return 'warning';
    return 'info';
  }

  limpiarFiltros(): void {
    this.filterForm.patchValue({
      grado: '',
      seccion: ''
    });
    this.buscarEstudiantesEnRiesgo();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportarReporte(): void {
    console.log('Exportar reporte');
  }

  verDetalleEstudiante(idEstudiante: number): void {
    this.router.navigate(['/components/evolucion-estudiante', idEstudiante]);
  }
}