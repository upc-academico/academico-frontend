import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Curso } from 'src/app/models/Curso';
import { CursoService } from 'src/app/services/curso.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css']
})
export class ListarComponent implements OnInit {

  datasource: MatTableDataSource<Curso> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['codigo', 'nombre', 'acciones'];

  constructor(
    private cS: CursoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarCursos();

    this.cS.getList().subscribe((data) => {
      this.datasource = new MatTableDataSource(data);
      this.datasource.paginator = this.paginator;
    });
  }

  cargarCursos(): void {
    this.cS.list().subscribe({
      next: (data) => {
        this.datasource = new MatTableDataSource(data);
        this.datasource.paginator = this.paginator;
      },
      error: (error) => {
        this.mostrarMensaje('Error al cargar los cursos', 'error');
      }
    });
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este curso?')) {
      this.cS.delete(id).subscribe({
        next: () => {
          this.mostrarMensaje('Curso eliminado exitosamente', 'success');
          this.cargarCursos();
        },
        error: (error) => {
          this.mostrarMensaje('Error al eliminar el curso', 'error');
        }
      });
    }
  }

  filter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasource.filter = filterValue.trim().toLowerCase();

    if (this.datasource.paginator) {
      this.datasource.paginator.firstPage();
    }
  }

  mostrarMensaje(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: tipo === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}