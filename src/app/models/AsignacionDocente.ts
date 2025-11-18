export class AsignacionDocente {
    idAsignacion: number = 0;
    idDocente: number = 0;
    nombreDocente: string = '';
    idCurso: number = 0;
    nombreCurso: string = '';
    grado: string = '';
    seccion: string = '';
    anioAcademico: number = new Date().getFullYear();
    enabled: boolean = true;
}