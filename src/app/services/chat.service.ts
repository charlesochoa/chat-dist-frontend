import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { ChatComponent } from '../components/chat/chat.component';
import { Message } from '../models/message';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  config = new ConfigService();
  stompClient: any;
  credentials: any;
  chatComponent: ChatComponent;
  token: string;

  constructor(chatComponent: ChatComponent){
      this.chatComponent = chatComponent;
  }

  _connect(user: User) {
    console.log("Initialize WebSocket Connection");
    let ws = new SockJS(this.config.WS_SERVER);
    this.stompClient = Stomp.over(ws);
    console.log(this.stompClient);
    const _this = this;
    _this.stompClient.connect(user, function (frame) {
      console.log(frame)
      _this.stompClient.subscribe(_this.config.topic + user.username, function (sdkEvent) {
          _this.onMessageReceived(sdkEvent.body);
      });
      _this._listen(user);
    }, this.errorCallBack);
  };

  
  set_authorization(token: string) {
    this.config.set_authorization(token);
  }

  set_token(token: string){
    this.token = token;
  }

  _disconnect() {
      console.log(this.stompClient);
      if (this.stompClient !== null && this.stompClient !== undefined && this.stompClient.connected) {
          this.stompClient.disconnect();
          console.log("Disconnected");
      } else {
        console.log("Already disconnected");
      }
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error) {
      console.log("errorCallBack -> " + error)
      setTimeout(() => {
      }, 5000);
  }

  /**
  * Send message to sever via web socket
  * @param {*} message 
  */
//  _send(message) {
//   console.log("SEND DIRECT JSON.stringify(message)");
//   console.log(JSON.stringify(message));
//   this.stompClient.send(this.config.WS_DIR_MESSAGE_CTRL + 
//     "send-direct-message", this.config.httpOptions, JSON.stringify(message));
//   }


  /**
  * Send message to sever via web socket
  * @param {*} message 
  */
 _listen(user) {
  console.log("Try to start listening websockets")
  this.stompClient.send("/app/receive-message", {}, JSON.stringify(user));
}

  /**
  * Send message to sever via web socket
  * @param {*} message 
  */
 test(message) {
  console.log("Try to start listening websockets")
  this.stompClient.send("app/chat.sendMessage", {}, JSON.stringify(message));
}

  onMessageReceived(body: string) {
      var message: Message = JSON.parse(body);
      console.log("Message Received from Server :: " + message);
      this.chatComponent.handleMessage(message);
  }




}

  