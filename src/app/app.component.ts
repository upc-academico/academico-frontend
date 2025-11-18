import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  role: string = '';
  username: string = '';
  notificationCount: number = 0;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadUserData();

    // Suscribirse a cambios en el estado de login
    this.loginService.loginStatus$.subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        this.loadUserData();
      }
    });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.loginService.verificar();
  }

  loadUserData(): void {
    this.role = this.loginService.showRole() || 'USER';
    this.username = this.getUsernameFromToken() || 'Usuario';
  }

  getUsernameFromToken(): string {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.username || 'Usuario';
      } catch (error) {
        console.error('Error al decodificar token:', error);
        return 'Usuario';
      }
    }
    return 'Usuario';
  }

  esAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  // ⬇️ NUEVO: Método para verificar si es docente
  esDocente(): boolean {
    return this.role === 'USER';
  }

  toggleSidenav(): void {
    console.log('Toggle sidenav');
  }

  cerrar(): void {
    sessionStorage.clear();
    this.isLoggedIn = false;
    this.loginService.notifyLoginStatus(false);
    this.router.navigate(['/']);
  }
}