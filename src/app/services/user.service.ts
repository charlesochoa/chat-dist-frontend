import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { ConfigService } from '../config/config.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Credentials } from '../models/credentials';
import { Chatroom } from '../models/chatroom';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 

  config = new ConfigService();
  authenticated = false;
  token: string;

  constructor(private httpClient: HttpClient) { }

  sign_up(newUser: User){
    // console.log("sign up services: " + this.config.sign_up + " User: " + JSON.stringify(newUser))
    return this.httpClient.post(this.config.sign_up, JSON.stringify(newUser),this.config.httpOptions);
  }


  login(newUser: Credentials){
    // console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(newUser));
    return this.httpClient.post<any>(this.config.sign_in, JSON.stringify(newUser),this.config.httpOptions);
  }

  get_profile(username: string){
    return this.httpClient.get(this.config.USER_CTRL + username,this.config.httpOptions)
  }
  
  set_authorization(token: string) {
    this.config.set_authorization(token);
  }


  get_all_users(){
    // console.log(this.config.USER_CTRL + "all/");
    return this.httpClient.get(this.config.USER_CTRL + "all/",this.config.httpOptions);
  }

  get_all_contacts(){
    // console.log(this.config.USER_CTRL + "all/");
    return this.httpClient.get(this.config.USER_CTRL + "all/normal",this.config.httpOptions);
  }

  get_all_direct_messages(user: User){
    // console.log(this.config.DIR_MESSAGE_CTRL + "all/" + JSON.stringify(user));
    return this.httpClient.get(this.config.DIR_MESSAGE_CTRL + "all/" + user.id,this.config.httpOptions);
  }


  get_my_chatrooms(user: User){
    // console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(user));
    return this.httpClient.get(this.config.CHATROOM_CTRL + "all/" + user.id,this.config.httpOptions);
  }

  get_all_chatrooms(){
    // console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(user));
    return this.httpClient.get(this.config.CHATROOM_CTRL + "all",this.config.httpOptions);
  }


  get_all_group_messages(chatroom: Chatroom){
    // console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(chatroom));
    return this.httpClient.get(this.config.GROUP_MESSAGE_CTRL + "all/" + chatroom.id,this.config.httpOptions);
  }

  create_group(admin:User, newGroup: Chatroom)
  {
    // console.log("login services: " + this.config.sign_in + " User: " + JSON.stringify(newGroup));
    return this.httpClient.post(this.config.CHATROOM_CTRL + "add/",JSON.stringify(newGroup),this.config.httpOptions);
  }

  send_message(message: Message)
  {
    if(message.chatroom!=null){
      return this.httpClient.post(this.config.GROUP_MESSAGE_CTRL + "send/" + message.chatroom.id,JSON.stringify(message),this.config.httpOptions)
 
    } else {
      return this.httpClient.post(this.config.DIR_MESSAGE_CTRL + "send",JSON.stringify(message),this.config.httpOptions)

    }
  }
  send_group_message(message: Message)
  {
    // console.log("send-group-message(message: Message)");
    return this.httpClient.post(this.config.GROUP_MESSAGE_CTRL + "send/" + message.chatroom.id,JSON.stringify(message),this.config.httpOptions)
  }

  add_user_to_group(contact:User, group: Chatroom)
  {
    return this.httpClient.post(this.config.CHATROOM_CTRL + group.id + "/add-user/" + contact.id,{},this.config.httpOptions);
  }

  all_users_from_group(group: Chatroom)
  {
    return this.httpClient.get(this.config.CHATROOM_CTRL + group.id + "/users/",this.config.httpOptions);
  }

  set_token(token: string){
    this.token = token;
  }

  send_message_to_all(message: Message) {
    return this.httpClient.post(this.config.DIR_MESSAGE_CTRL + "send-all",JSON.stringify(message),this.config.httpOptions)
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




}
