import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Message } from './message';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

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



  public sendGetRequest(){
    console.log("sendGetRequest in service");
    var res = this.httpClient.get(this.REST_API_SERVER).pipe(catchError(this.handleError));
    console.log(res);
    return res;
  }


  public sendMessage(message: Message){
    var res = this.httpClient.get(this.REST_API_SERVER + "send?from=" +message.from +"&to=" + message.to+"&msg=" +message.msg);
    console.log(res);
    return res;
  }


  public receiveMessage(me: String){
    var res = this.httpClient.get(this.REST_API_SERVER + "receive?me=" +me);
    console.log(res);
    return res;
  }

  
} 
