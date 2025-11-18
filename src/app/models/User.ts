export class User {
    id?: number;
    dni: string = '';
    nombres: string = '';
    apellidos: string = '';
    email: string = '';
    celular: string = '';
    username: string = '';
    password: string = '';
    role: string = 'USER'; // Por defecto USER
    enabled: boolean = true;
}