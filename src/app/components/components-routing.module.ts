import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { CursoComponent } from './curso/curso.component';
import { CreaeditaComponent } from './curso/creaedita/creaedita.component';
import { GuardService } from '../services/guard.service';
import { EstudianteComponent } from './estudiante/estudiante.component';
import { CreaeditaEstudianteComponent } from './estudiante/creaedita-estudiante/creaedita-estudiante.component';
import { CompetenciaComponent } from './competencia/competencia.component';
import { CreaeditaCompetenciaComponent } from './competencia/creaedita-competencia/creaedita-competencia.component';
import { UsersComponent } from './users/users.component';
import { CreaeditaUsersComponent } from './users/creaedita-users/creaedita-users.component';
import { RegisterComponent } from './register/register.component';
import { PanelRiesgoComponent } from './panel-riesgo/panel-riesgo.component';
import { EvolucionEstudianteComponent } from './evolucion-estudiante/evolucion-estudiante.component';
import { ListarNotaComponent } from './listar-nota/listar-nota.component';
import { CreaeditaNotaComponent } from './creaedita-nota/creaedita-nota.component';
import { ListarAsignacionComponent } from './listar-asignacion/listar-asignacion.component';
import { CreaeditaAsignacionComponent } from './creaedita-asignacion/creaedita-asignacion.component';

// Componentes de docentes (HU-13, 15, 16, 17)
import { FiltroNotasComponent } from './docente/filtro-notas/filtro-notas.component';
import { DistribucionCalificacionesComponent } from './docente/distribucion-calificaciones/distribucion-calificaciones.component';
import { CompetenciasRiesgoComponent } from './docente/competencias-riesgo/competencias-riesgo.component';
import { EvolucionCompetenciaComponent } from './docente/evolucion-competencia/evolucion-competencia.component';

const routes: Routes = [
  {
    path: 'cursos',
    component: CursoComponent,
    children: [
      { path: 'nuevo', component: CreaeditaComponent },
      { path: 'ediciones/:id', component: CreaeditaComponent },
    ],
    canActivate: [GuardService],
  },

  {
    path: 'users',
    component: UsersComponent,
    children: [
      { path: 'nuevo', component: CreaeditaUsersComponent },
      { path: 'ediciones/:id', component: CreaeditaUsersComponent },
    ],
    canActivate: [GuardService],
  },

  {
    path: 'estudiantes',
    component: EstudianteComponent,
    children: [
      { path: 'nuevo', component: CreaeditaEstudianteComponent },
      { path: 'ediciones/:id', component: CreaeditaEstudianteComponent },
    ],
    canActivate: [GuardService],
  },

  {
    path: 'competencias',
    component: CompetenciaComponent,
    children: [
      { path: 'nuevo', component: CreaeditaCompetenciaComponent },
      { path: 'ediciones/:id', component: CreaeditaCompetenciaComponent },
    ],
    canActivate: [GuardService],
  },

  {
    path: 'notas',
    component: ListarNotaComponent,
    canActivate: [GuardService],
  },
  {
    path: 'notas/ediciones/:id',
    component: CreaeditaNotaComponent,
    canActivate: [GuardService],
  },
  {
    path: 'notas/nuevo',
    component: CreaeditaNotaComponent,
    canActivate: [GuardService],
  },
  {
    path: 'asignaciones',
    component: ListarAsignacionComponent,
    canActivate: [GuardService],
  },
  {
    path: 'asignaciones/nuevo',
    component: CreaeditaAsignacionComponent,
    canActivate: [GuardService],
  },
  {
    path: 'asignaciones/ediciones/:id',
    component: CreaeditaAsignacionComponent,
    canActivate: [GuardService],
  },

  // Rutas para ADMIN y DOCENTES
  {
    path: 'panel-riesgo',
    component: PanelRiesgoComponent,
    canActivate: [GuardService],
  },

  {
    path: 'evolucion-estudiante/:id',
    component: EvolucionEstudianteComponent,
    canActivate: [GuardService],
  },

  // Rutas para DOCENTES (HU-13, 15, 16, 17)
  {
    path: 'docente/filtro-notas',
    component: FiltroNotasComponent,
    canActivate: [GuardService],
  },
  {
    path: 'docente/distribucion-calificaciones',
    component: DistribucionCalificacionesComponent,
    canActivate: [GuardService],
  },
  {
    path: 'docente/competencias-riesgo',
    component: CompetenciasRiesgoComponent,
    canActivate: [GuardService],
  },
  {
    path: 'docente/evolucion-competencia',
    component: EvolucionCompetenciaComponent,
    canActivate: [GuardService],
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [GuardService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentsRoutingModule { }