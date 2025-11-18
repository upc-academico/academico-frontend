import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsRoutingModule } from './components-routing.module';
import { WelcomeComponent } from './welcome/welcome.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CursoComponent } from './curso/curso.component';
import { ListarComponent } from './curso/listar/listar.component';
import { CreaeditaComponent } from './curso/creaedita/creaedita.component';
import { CompetenciaComponent } from './competencia/competencia.component';
import { EstudianteComponent } from './estudiante/estudiante.component';
import { UsersComponent } from './users/users.component';

import { CreaeditaEstudianteComponent } from './estudiante/creaedita-estudiante/creaedita-estudiante.component';
import { ListarEstudianteComponent } from './estudiante/listar-estudiante/listar-estudiante.component';
import { ListarUsersComponent } from './users/listar-users/listar-users.component';
import { CreaeditaUsersComponent } from './users/creaedita-users/creaedita-users.component';
import { CreaeditaCompetenciaComponent } from './competencia/creaedita-competencia/creaedita-competencia.component';
import { ListarCompetenciaComponent } from './competencia/listar-competencia/listar-competencia.component';

import { RegisterComponent } from './register/register.component';
import { CreaeditaNotaComponent } from './creaedita-nota/creaedita-nota.component';
import { ListarNotaComponent } from './listar-nota/listar-nota.component';
import { PanelRiesgoComponent } from './panel-riesgo/panel-riesgo.component';
import { EvolucionEstudianteComponent } from './evolucion-estudiante/evolucion-estudiante.component';
import { DashboardGradoComponent } from './dashboard-grado/dashboard-grado.component';
import { CreaeditaAsignacionComponent } from './creaedita-asignacion/creaedita-asignacion.component';
import { ListarAsignacionComponent } from './listar-asignacion/listar-asignacion.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { FiltroNotasComponent } from './docente/filtro-notas/filtro-notas.component';
import { DistribucionCalificacionesComponent } from './docente/distribucion-calificaciones/distribucion-calificaciones.component';
import { CompetenciasRiesgoComponent } from './docente/competencias-riesgo/competencias-riesgo.component';
import { EvolucionCompetenciaComponent } from './docente/evolucion-competencia/evolucion-competencia.component';

@NgModule({
  declarations: [
    WelcomeComponent,
    CursoComponent,
    ListarComponent,
    CreaeditaComponent,
    CompetenciaComponent,
    EstudianteComponent,
    UsersComponent,
    CreaeditaEstudianteComponent,
    ListarEstudianteComponent,
    ListarUsersComponent,
    CreaeditaUsersComponent,
    CreaeditaCompetenciaComponent,
    ListarCompetenciaComponent,
    RegisterComponent,
    CreaeditaNotaComponent,
    ListarNotaComponent,
    PanelRiesgoComponent,
    EvolucionEstudianteComponent,
    DashboardGradoComponent,
    CreaeditaAsignacionComponent,
    ListarAsignacionComponent,
    FiltroNotasComponent,
    DistribucionCalificacionesComponent,
    CompetenciasRiesgoComponent,
    EvolucionCompetenciaComponent,

  ],
  imports: [
    CommonModule,
    ComponentsRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule
  ]
})
export class ComponentsModule { }
