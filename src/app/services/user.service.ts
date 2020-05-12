import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { ConfigService } from '../config/config.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Credentials } from '../models/credentials';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  config = new ConfigService();
  authenticated = false;
  token: string;

  constructor(private httpClient: HttpClient) { }

  sign_up(newUser: User){
    console.log("sign up services: " + this.config.sign_up + " User: " + JSON.stringify(newUser))
    return this.httpClient.post(this.config.sign_up, JSON.stringify(newUser),this.config.httpOptions);
  }


  login(newUser: Credentials){
    console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(newUser));
    return this.httpClient.post<any>(this.config.sign_in, JSON.stringify(newUser),this.config.httpOptions);
  }
  
  set_authorization(token: string) {
    this.config.set_authorization(token);
  }

  get_all_direct_messages(user: User){
    console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(user));
    return this.httpClient.get(this.config.DIR_MESSAGE_CTRL + "all/" + user.id,this.config.httpOptions);
  }


  get_all_chatrooms(user: User){
    console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(user));
    return this.httpClient.get(this.config.CHATROOM_CTRL + "all/" + user.id,this.config.httpOptions);
  }


  set_token(token: string){
    this.token = token;
  }
  
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        'Backend returned code ${error.status}, ' +
        'body was: ${error.error}');
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };









  authenticate(credentials) {

    const headers = new HttpHeaders(credentials ? {
        Authorization : 'Basic ' + btoa(credentials.username + ':' + credentials.password)
    } : {});

    this.httpClient.get(this.config.sign_in, {headers: headers}).subscribe(response => {
        console.log(response)
    });

  }
}
