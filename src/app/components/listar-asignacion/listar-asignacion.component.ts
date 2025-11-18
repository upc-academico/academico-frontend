import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AsignacionDocente } from 'src/app/models/AsignacionDocente';
import { AsignacionDocenteService } from 'src/app/services/asignacion-docente.service';

@Component({
  selector: 'app-listar-asignacion',
  templateUrl: './listar-asignacion.component.html',
  styleUrls: ['./listar-asignacion.component.css']
})
export class ListarAsignacionComponent implements OnInit {

  dataSource: MatTableDataSource<AsignacionDocente> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'docente',
    'curso',
    'grado',
    'seccion',
    'anio',
    'acciones'
  ];

  constructor(
    private adS: AsignacionDocenteService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();

    this.adS.getList().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  loadData(): void {
    this.adS.list().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta asignación? Esta acción no se puede deshacer.')) {
      this.adS.delete(id).subscribe({
        next: () => {
          this.adS.list().subscribe((data) => {
            this.adS.setList(data);
          });

          this.snackBar.open('Asignación eliminada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error:', error);
          this.snackBar.open('Error al eliminar la asignación', 'Cerrar', {
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

  exportarExcel(): void {
    // Implementar exportación a Excel
    this.snackBar.open('Función de exportación en desarrollo', 'Cerrar', {
      duration: 3000
    });
  }
}