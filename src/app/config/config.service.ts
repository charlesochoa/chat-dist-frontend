import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, using, pipe, config } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ReturnStatement } from '@angular/compiler';

@Injectable()
export class ConfigService {

  
  // Develop
  // WS_SERVER = 'http://192.168.1.149:8080/ws/';
  // SERVER = 'http://192.168.1.149:8080/';
  // UPLOAD_SERVER = 'http://192.168.1.149:8080/';
  // WS_SERVER = 'http://localhost:8080/ws/';
  // SERVER = 'http://localhost:8080/';
  // UPLOAD_SERVER = 'http://localhost:8080/';
  // Production
  WS_SERVER = "https://chat-dist-backend.herokuapp.com/ws";
  SERVER = "https://chat-dist-backend.herokuapp.com/";
  UPLOAD_SERVER = "https://chat-dist-file-storage.herokuapp.com/";
  AUX_CTRL = this.SERVER + "";
  AUTH_CTRL = this.SERVER + "auth/";
  DIR_MESSAGE_CTRL = this.SERVER + "direct-messages/";
  GROUP_MESSAGE_CTRL = this.SERVER + "group-messages/";
  FILES_CTRL = this.UPLOAD_SERVER + "files/";
  CHATROOM_CTRL = this.SERVER + "chatrooms/";
  USER_CTRL = this.SERVER + "users/";
  sign_up = this.AUTH_CTRL + "sign-up"
  sign_in = this.SERVER + "login"
  topic = "/topic/chat/";
  auth = "/auth"

  

  stompClient: any;
  credentials: any;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      observe: 'response',
      
    })
  };

  constructor() { }

  set_authorization(token: string){
    
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        observe: 'response',
        Authorization: token,
      })
    };
  }
}