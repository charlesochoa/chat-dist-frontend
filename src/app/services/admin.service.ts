import { Injectable } from '@angular/core';
import { AdminComponent } from '../components/admin/admin.component';
import { ConfigService } from '../config/config.service';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { User } from '../models/user';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  
  config = new ConfigService();
  stompClient: any;
  credentials: any;
  adminComponent: AdminComponent;
  token: string;
  tokenHeader = {};
  constructor(adminComponent: AdminComponent){
      this.adminComponent = adminComponent;
  }

  _connect_admin() {
    console.log("Initialize WebSocket Connection");
    let ws = new SockJS(this.config.WS_SERVER);
    this.stompClient = Stomp.over(ws);
    console.log(this.stompClient);
    const _this = this;
    _this.stompClient.connect(this.tokenHeader, function (frame) {
      console.log(frame)
      _this.stompClient.subscribe(_this.config.topic + "admin", function (sdkEvent) {
          _this.onMessageReceived(sdkEvent.body);
      }, this.tokenHeader);
      _this._listen();
    }, this.errorCallBack);
  };

  set_authorization(token: string) {
    this.config.set_authorization(token);
  }

  set_token(token: string){
    this.token = token;
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
 _listen() {
  console.log("Try to start listening websockets Statistics")
    // this.stompClient.send("/app/receive-message", this.tokenHeader, JSON.stringify(user));
}

  /**
  * Send message to sever via web socket
  * @param {*} message 
  */
 test(message) {
  console.log("Try to start listening websockets")
  this.stompClient.send("app/chat.sendMessage", this.tokenHeader, JSON.stringify(message));
}

  onMessageReceived(body: string) {
      var message: Message = JSON.parse(body);
      console.log("Message Received from Server :: " + JSON.stringify(message));
      this.adminComponent.handleMessage(message);
  }



}
