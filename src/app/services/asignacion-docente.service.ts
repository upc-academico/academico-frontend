import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environments';
import { AsignacionDocente } from '../models/AsignacionDocente';
import { Subject, Observable } from 'rxjs';

const base_url = environment.base;

@Injectable({
    providedIn: 'root'
})
export class AsignacionDocenteService {

    private url = `${base_url}/asignacion`;
    private listaCambio = new Subject<AsignacionDocente[]>();

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        let token = sessionStorage.getItem('token');
        return new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json');
    }

    list(): Observable<AsignacionDocente[]> {
        return this.http.get<AsignacionDocente[]>(this.url, { headers: this.getHeaders() });
    }

    insert(asignacion: AsignacionDocente): Observable<any> {
        return this.http.post(this.url, asignacion, { headers: this.getHeaders() });
    }

    update(asignacion: AsignacionDocente): Observable<any> {
        return this.http.put(this.url, asignacion, { headers: this.getHeaders() });
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.url}/${id}`, { headers: this.getHeaders() });
    }

    listId(id: number): Observable<AsignacionDocente> {
        return this.http.get<AsignacionDocente>(`${this.url}/${id}`, { headers: this.getHeaders() });
    }

    findByDocente(idDocente: number): Observable<AsignacionDocente[]> {
        return this.http.get<AsignacionDocente[]>(`${this.url}/docente/${idDocente}`, { headers: this.getHeaders() });
    }

    findByGradoSeccion(grado: string, seccion: string): Observable<AsignacionDocente[]> {
        return this.http.get<AsignacionDocente[]>(`${this.url}/grado/${grado}/seccion/${seccion}`, { headers: this.getHeaders() });
    }

    findByAnio(anio: number): Observable<AsignacionDocente[]> {
        return this.http.get<AsignacionDocente[]>(`${this.url}/anio/${anio}`, { headers: this.getHeaders() });
    }

    setList(listaNueva: AsignacionDocente[]): void {
        this.listaCambio.next(listaNueva);
    }

    getList(): Observable<AsignacionDocente[]> {
        return this.listaCambio.asObservable();
    }
}