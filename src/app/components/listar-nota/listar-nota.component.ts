import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Nota } from 'src/app/models/Nota';
import { NotaService } from 'src/app/services/nota.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-nota',
  templateUrl: './listar-nota.component.html',
  styleUrls: ['./listar-nota.component.css']
})
export class ListarNotaComponent implements OnInit {

  dataSource: MatTableDataSource<Nota> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'estudiante',
    'curso',
    'competencia',
    'calificacion',
    'periodo',
    'anio',
    'docente',
    'observacion',
    'acciones'
  ];

  constructor(
    private nS: NotaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();

    this.nS.getList().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  loadData(): void {
    this.nS.list().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      
      // Configurar filtro personalizado
      this.dataSource.filterPredicate = (data: Nota, filter: string) => {
        const searchStr = filter.toLowerCase();
        return data.nombreEstudiante.toLowerCase().includes(searchStr) ||
               data.nombreCompetencia.toLowerCase().includes(searchStr) ||
               data.nombreDocente.toLowerCase().includes(searchStr) ||
               data.calificacion.toLowerCase().includes(searchStr) ||
               data.periodo.toLowerCase().includes(searchStr);
      };
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta nota? Esta acción no se puede deshacer.')) {
      this.nS.delete(id).subscribe({
        next: () => {
          this.nS.list().subscribe((data) => {
            this.nS.setList(data);
          });

          this.snackBar.open('Nota eliminada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error:', error);
          this.snackBar.open('Error al eliminar la nota', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  editar(id: number): void {
    this.router.navigate(['components/notas/ediciones', id]);
  }

  filter(event: any): void {
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

  getCalificacionColor(calificacion: string): string {
    const colors: { [key: string]: string } = {
      'AD': '#4caf50',
      'A': '#2196f3',
      'B': '#ff9800',
      'C': '#f44336'
    };
    return colors[calificacion] || '#757575';
  }

  exportarExcel(): void {
    this.snackBar.open('Función de exportación en desarrollo', 'Cerrar', {
      duration: 3000
    });
  }
}