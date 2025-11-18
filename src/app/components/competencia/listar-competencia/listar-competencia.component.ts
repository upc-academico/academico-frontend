import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Competencia } from 'src/app/models/Competencia';
import { CompetenciaService } from 'src/app/services/competencia.service';

@Component({
  selector: 'app-listar-competencia',
  templateUrl: './listar-competencia.component.html',
  styleUrls: ['./listar-competencia.component.css']
})
export class ListarCompetenciaComponent implements OnInit{

  dataSource: MatTableDataSource<Competencia> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'idCompetencia',
    'nombreCompetencia',
    'curso',
    'accion01',
    'accion02'
  ];

  constructor(private coS: CompetenciaService) {}

  ngOnInit(): void {
    this.coS.list().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
    });
    this.coS.getList().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
    });
  }
  eliminar(id: number){
    this.coS.delete(id).subscribe((data) => {
      this.coS.list().subscribe((data) => {
      this.coS.setList(data);
      });
      });      
  }

  filter(en: any) {     //para filtrar la info
    this.dataSource.filter = en.target.value.trim();
  }
}
