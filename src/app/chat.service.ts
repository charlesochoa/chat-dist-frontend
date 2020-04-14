import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Message } from './message';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // Develop
  //private REST_API_SERVER = "http://localhost:8080/";
  // Production
  private REST_API_SERVER = "https://chat-dist-backend.herokuapp.com/";

  constructor(private httpClient: HttpClient) { }


  
  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  public signUp(user: User)
  {
    var res = this.httpClient.post(this.REST_API_SERVER + "user/signup?name=" + user.name + "&email=" + user.email,null).pipe(catchError(this.handleError));
    return res;
  }


  // public sendGetRequest(){
  //   console.log("sendGetRequest in service");
  //   var res = this.httpClient.get(this.REST_API_SERVER).pipe(catchError(this.handleError));
  //   return res;
  // }


  public sendMessage(from: String, to: String, msg: String)
  {
    var res = this.httpClient.get(this.REST_API_SERVER + "send?from=" + from +
                                   "&to=" + to + "&msg=" + msg);
    console.log(res);
    return res;
  }


  public receiveMessage(me: String)
  {
    var res = this.httpClient.get(this.REST_API_SERVER + "receive?me=" +me);
    console.log(res);
    return res;
  }

  
} 
