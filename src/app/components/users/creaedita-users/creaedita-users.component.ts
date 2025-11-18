import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-creaedita-users',
  templateUrl: './creaedita-users.component.html',
  styleUrls: ['./creaedita-users.component.css']
})
export class CreaeditaUsersComponent implements OnInit{

    form: FormGroup = new FormGroup({});
    user:User = new User();
    mensaje: string = '';
    id: number = 0;
    edicion: boolean=false;

    roles:{ value: string; viewValue: string}[]=[
    { value:'ADMIN', viewValue: 'ADMIN'},
    { value:'USER', viewValue: 'USER'},
  ];

  constructor(
      private uS: UsersService,
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
          id: [''],
          dni: ['', Validators.required],
          nombres: ['', Validators.required],
          apellidos: ['', Validators.required],
          email: ['', Validators.required],
          celular: ['', Validators.required],
          username: ['', Validators.required],
          password: ['', Validators.required],
          role: [''],       //manejar con edición para el actualizar 
        });
  }

  aceptar(): void {
      if (this.form.valid) {
        this.user.id = this.form.value.id;
        this.user.dni = this.form.value.dni;
        this.user.nombres = this.form.value.nombres;
        this.user.apellidos = this.form.value.apellidos;
        this.user.email = this.form.value.email;
        this.user.celular = this.form.value.celular;
        this.user.username = this.form.value.username;
        this.user.password = this.form.value.password;
        this.user.role = this.form.value.role;
        this.user.enabled =  true;
        if (this.edicion) {
          this.uS.update(this.user).subscribe(() => {
            this.uS.list().subscribe((data) => {
              this.uS.setList(data);
            });
          });
        } else {
          this.uS.insert(this.user).subscribe((data) => {
            this.uS.list().subscribe((data) => {
              this.uS.setList(data);
            });
          });
        }
        this.router.navigate(['components/users']);
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
  
    init() {
      if (this.edicion) {
        this.uS.listId(this.id).subscribe((data) => {
          this.form = new FormGroup({
            id: new FormControl(data.id),
            dni: new FormControl(data.dni),
            nombres: new FormControl(data.nombres),
            apellidos: new FormControl(data.apellidos),
            email: new FormControl(data.email),
            celular: new FormControl(data.celular),
            username: new FormControl(data.username),
            password: new FormControl(data.password),
            role: new FormControl(data.role),
            enabled:new FormControl(data.enabled),
          });
        });
      }
    }
}
