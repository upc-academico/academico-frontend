import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Estudiante } from 'src/app/models/Estudiante';
import { EstudianteService } from 'src/app/services/estudiante.service';

@Component({
  selector: 'app-listar-estudiante',
  templateUrl: './listar-estudiante.component.html',
  styleUrls: ['./listar-estudiante.component.css']
})
export class ListarEstudianteComponent implements OnInit{

  datasource: MatTableDataSource<Estudiante> = new MatTableDataSource();
    @ViewChild(MatPaginator) paginator!: MatPaginator;
  
    displayedColumns: string[] = [
      'cod',
      'dni',
      'nombres',
      'apellidos',
      'grado',
      'seccion',
      'accion01',
      'accion02',
    ];

  constructor(private eS:EstudianteService){}

  ngOnInit(): void {
    this.eS.list().subscribe((data) => {
      this.datasource = new MatTableDataSource(data);
      this.datasource.paginator = this.paginator;
    });
    this.eS.getList().subscribe((data) => {
      this.datasource = new MatTableDataSource(data);
      this.datasource.paginator = this.paginator;

    });
  }
  
  eliminar(id: number) {
    this.eS.delete(id).subscribe((data) => {
    this.eS.list().subscribe((data) => {
    this.eS.setList(data);
    });
    });
    }

  filter(en: any) {
  this.datasource.filter = en.target.value.trim();
  }
}

