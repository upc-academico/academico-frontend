import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtRequest } from '../models/jwRequest';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private loginStatusSubject = new Subject<boolean>();
  loginStatus$ = this.loginStatusSubject.asObservable();

  constructor(private http: HttpClient) { }
  login(request: JwtRequest) {
    return this.http.post(`${environment.base}/auth/login`, request);
  }
  verificar() {
    let token = sessionStorage.getItem("token");
    return token != null;

  }
  showRole(){   //sirva para mostrar el rol -_-
    let token = sessionStorage.getItem("token");
    if (!token) {
      // Manejar el caso en el que el token es nulo.
      console.warn('No hay token en sessionStorage');
      return null; // O cualquier otro valor predeterminado dependiendo del contexto.
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('Token inválido - no tiene 3 partes:', token);
      return null;
    }

    try {
      const helper = new JwtHelperService();
      const decodedToken = helper.decodeToken(token);
      console.log('Token decodificado:', decodedToken);
      return decodedToken?.role;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  notifyLoginStatus(status: boolean) {
    this.loginStatusSubject.next(status);
  }
}
