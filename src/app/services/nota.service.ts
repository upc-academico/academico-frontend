import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { Nota } from '../models/Nota';
import { Subject, Observable } from 'rxjs';

const base_url = environment.base;

@Injectable({
    providedIn: 'root'
})
export class NotaService {

    private url = `${base_url}/nota`;
    private listaCambio = new Subject<Nota[]>();

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        let token = sessionStorage.getItem('token');
        return new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');
    }

    list(): Observable<Nota[]> {
        return this.http.get<Nota[]>(this.url, { headers: this.getHeaders() });
    }

    insert(nota: Nota): Observable<any> {
        return this.http.post(this.url, nota, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    update(nota: Nota): Observable<any> {
        return this.http.put(this.url, nota, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.url}/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    listId(id: number): Observable<Nota> {
        return this.http.get<Nota>(`${this.url}/${id}`, { headers: this.getHeaders() });
    }

    // Métodos existentes
    findByEstudiante(idEstudiante: number): Observable<Nota[]> {
        return this.http.get<Nota[]>(`${this.url}/estudiante/${idEstudiante}`, { headers: this.getHeaders() });
    }

    // ⬇️ ACTUALIZADO: Riesgo académico (≥2 competencias con C)
    findEstudiantesConRiesgoAcademico(periodo: string, anio: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}/riesgo/academico/${periodo}/${anio}`, { headers: this.getHeaders() });
    }

    findEstudiantesEnRiesgo(periodo: string, anio: number): Observable<Nota[]> {
        return this.http.get<Nota[]>(`${this.url}/riesgo/${periodo}/${anio}`, { headers: this.getHeaders() });
    }

    findByGradoSeccionPeriodo(grado: string, seccion: string, periodo: string, anio: number): Observable<Nota[]> {
        return this.http.get<Nota[]>(`${this.url}/grado/${grado}/seccion/${seccion}/periodo/${periodo}/anio/${anio}`, { headers: this.getHeaders() });
    }

    getEvolucionEstudiante(idEstudiante: number): Observable<Nota[]> {
        return this.http.get<Nota[]>(`${this.url}/evolucion/${idEstudiante}`, { headers: this.getHeaders() });
    }

    // ========== NUEVOS MÉTODOS PARA DOCENTES (HU-13, 15, 16, 17) ==========

    // HU-15: Obtener notas filtradas por docente
    findByDocenteCompetenciaSeccion(
        idDocente: number,
        idCurso: number,
        idCompetencia: number,
        seccion: string,
        periodo: string,
        anio: number
    ): Observable<Nota[]> {
        return this.http.get<Nota[]>(
            `${this.url}/docente/${idDocente}/curso/${idCurso}/competencia/${idCompetencia}/seccion/${seccion}/periodo/${periodo}/anio/${anio}`,
            { headers: this.getHeaders() }
        );
    }

    // HU-16: Obtener distribución de calificaciones
    getDistribucionCalificaciones(
        idDocente: number,
        idCompetencia: number,
        seccion: string,
        periodo: string,
        anio: number
    ): Observable<{ [key: string]: number }> {
        return this.http.get<{ [key: string]: number }>(
            `${this.url}/docente/${idDocente}/distribucion/competencia/${idCompetencia}/seccion/${seccion}/periodo/${periodo}/anio/${anio}`,
            { headers: this.getHeaders() }
        );
    }

    // HU-17: Obtener competencias con mayor riesgo
    getCompetenciasConRiesgo(
        idDocente: number,
        idCurso: number,
        seccion: string,
        periodo: string,
        anio: number
    ): Observable<any[]> {
        return this.http.get<any[]>(
            `${this.url}/docente/${idDocente}/competencias-riesgo/curso/${idCurso}/seccion/${seccion}/periodo/${periodo}/anio/${anio}`,
            { headers: this.getHeaders() }
        );
    }

    // HU-13: Evolución por competencia específica
    getEvolucionPorCompetencia(idEstudiante: number, idCompetencia: number): Observable<Nota[]> {
        return this.http.get<Nota[]>(
            `${this.url}/evolucion/estudiante/${idEstudiante}/competencia/${idCompetencia}`,
            { headers: this.getHeaders() }
        );
    }

    setList(listaNueva: Nota[]): void {
        this.listaCambio.next(listaNueva);
    }

    getList(): Observable<Nota[]> {
        return this.listaCambio.asObservable();
    }
}