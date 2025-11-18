import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Competencia } from 'src/app/models/Competencia';
import { Curso } from 'src/app/models/Curso';
import { CompetenciaService } from 'src/app/services/competencia.service';
import { CursoService } from 'src/app/services/curso.service';

@Component({
  selector: 'app-creaedita-competencia',
  templateUrl: './creaedita-competencia.component.html',
  styleUrls: ['./creaedita-competencia.component.css']
})
export class CreaeditaCompetenciaComponent implements OnInit{

    form: FormGroup = new FormGroup({});
    competencia: Competencia = new Competencia();
    mensaje: string = '';
    id: number = 0;
    edicion: boolean=false;
    listaCursos: Curso[]=[];
    
    constructor(
      private coS:CompetenciaService,
      private cS:CursoService,
      private router: Router,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute
    ) {}

  ngOnInit(): void {
          this.route.params.subscribe((data: Params) => {
          this.id = data['id'];
          this.edicion = data['id'] != null;
          this.init();
        });
        this.form = this.formBuilder.group({
          idCompetencia: [''],
          nombreCompetencia: ['', Validators.required],
          curso: ['',Validators.required],
        });

        this.cS.list().subscribe((data) => {
        this.listaCursos= data;
      })
  }

  aceptar(): void {
      if (this.form.valid) {
        this.competencia.idCompetencia = this.form.value.idCompetencia;
        this.competencia.nombreCompetencia = this.form.value.nombreCompetencia;
        this.competencia.enabled =  false;   //validar para poder mostrar en el listar
        this.competencia.curso.idCurso = this.form.value.curso;
  
        if (this.edicion) {
          this.coS.update(this.competencia).subscribe(() => {
            this.coS.list().subscribe((data) => {
              this.coS.setList(data);
            });
          });
        } else {
          this.coS.insert(this.competencia).subscribe((data) => {
            this.coS.list().subscribe((data) => {
              this.coS.setList(data);
            });
          });
        }
        this.router.navigate(['components/competencias']);
      } else {
        this.mensaje = 'Por favor complete todos los campos obligatorios.';
      }
    }
    obtenerControlCampo(nombreCampo: string): AbstractControl {
      const control = this.form.get(nombreCampo);
      if (!control) {
        throw new Error(`Control no encontrado para el campo ${nombreCampo}`);
      }
      return control;
    }
  
    init(){
  if (this.edicion) {
        this.coS.listId(this.id).subscribe((data) => {
          this.form = new FormGroup({
            idCompetencia: new FormControl(data.idCompetencia),
            nombreCompetencia: new FormControl(data.nombreCompetencia),
            enabled:new FormControl(data.enabled),
            curso: new FormControl(data.curso.idCurso),
          });
        });
      }
    }
}
