
import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Credentials } from '../../models/credentials';
import { NotificationService } from 'src/app/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  
  credentials: Credentials;
  token: string;
  password: string;
  username: string;
  error: string;

  constructor(private userService: UserService, 
              private notificationService: NotificationService,
              private router: Router,)
  {
    this.username = "";
    this.password = "";
    this.token = "";
  }
  ngOnInit() {
  }


  sign_up()
  {
    this.userService.sign_up(new User(null,this.username,null,this.password,null,[])).subscribe((data: any) => 
    {
      console.log(data);
      this.notificationService.showSuccess("Usuario creado exitosamente","¡Enhorabuena!");

    })
  }
  login()
  {
    if(this.password!= "" && this.username!=""){
      this.credentials = new Credentials(this.username,this.password);
      this.userService.login(this.credentials)

      .subscribe((response: User) => 
      {
        console.log(response);
        if(response!=null) 
        {
          this.notificationService.showSuccess("","¡Enhorabuena!")
          this.token = response["Authorization"];
          console.log(this.token);
          if(this.username=="admin"){
            this.router.navigate(['/admin',{ token: this.token , username: this.username}])
          } else {
            this.router.navigate(['/chat',{ token: this.token , username: this.username}])
          }
        }

      });
    } else {
      this.notificationService.showError("Los campos no deben estar vacíos", "Error de ingreso");
    }
  }
}
