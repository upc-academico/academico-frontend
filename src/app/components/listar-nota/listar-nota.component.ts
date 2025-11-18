import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Nota } from 'src/app/models/Nota';
import { NotaService } from 'src/app/services/nota.service';

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
    'competencia',
    'calificacion',
    'estado',
    'periodo',
    'anio',
    'docente',
    'acciones'
  ];

  constructor(
    private nS: NotaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta nota?')) {
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

  filter(event: any): void {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'En Riesgo': return 'estado-riesgo';
      case 'Regular': return 'estado-regular';
      case 'Satisfactorio': return 'estado-satisfactorio';
      case 'Destacado': return 'estado-destacado';
      default: return '';
    }
  }
}