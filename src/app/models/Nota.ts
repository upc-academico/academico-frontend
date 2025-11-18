export class Nota {
    idNota: number = 0;
    idEstudiante: number = 0;
    nombreEstudiante: string = '';
    idCompetencia: number = 0;
    nombreCompetencia: string = '';
    idDocente: number = 0;
    nombreDocente: string = '';
    calificacion: string = ''; // ⬅️ Cambiado de number a string
    periodo: string = '';
    anio: number = new Date().getFullYear();
    fechaRegistro: Date = new Date();
    observacion: string = '';
    enabled: boolean = true;
    estadoAcademico: string = '';
}