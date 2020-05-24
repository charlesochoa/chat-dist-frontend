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
  tokenHeader = {};
  constructor(chatComponent: ChatComponent){
      this.chatComponent = chatComponent;
  }

  _connect(user: User) {
    console.log("Initialize WebSocket Connection");
    let ws = new SockJS(this.config.WS_SERVER);
    this.stompClient = Stomp.over(ws);
    console.log(this.stompClient);
    const _this = this;
    _this.stompClient.connect(this.tokenHeader, function (frame) {
      console.log(frame)
      _this.stompClient.subscribe(_this.config.topic + user.username, function (sdkEvent) {
          _this.onMessageReceived(sdkEvent.body);
      }, this.tokenHeader);
      _this._listen(user);
    }, this.errorCallBack);
  };

  
  set_authorization(token: string) {
    this.token = token;
    this.config.set_authorization(token);
    this.tokenHeader = {'Authorization': this.token};
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
  * Start listener of messages in server
  * @param {*} user 
  */
 _listen(user) {
  console.log("Try to start listening websockets")
    this.stompClient.send("/app/receive-message", this.tokenHeader, JSON.stringify(user));
}

  onMessageReceived(body: string) {
      var message: Message = JSON.parse(body);
      console.log("Message Received from Server :: " + JSON.stringify(message));
      this.chatComponent.handleMessage(message);
  }




}

  