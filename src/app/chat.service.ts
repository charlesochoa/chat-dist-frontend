import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { ChatComponent } from './chat/chat.component';
import { Message } from './message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // Developº
  private API_SERVER = 'http://localhost:8080/ws';
  topic: string = "/topic/chat";
  stompClient: any;
  credentials: any;
  chatComponent: ChatComponent;
  // Production
  //private API_SERVER = "https://chat-dist-backend.herokuapp.com/ws";

  constructor(chatComponent: ChatComponent){
      this.chatComponent = chatComponent;
  }


  _connect(credentials) {
    console.log("Initialize WebSocket Connection");
    let ws = new SockJS(this.API_SERVER);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect({}, function (frame) {
        _this.stompClient.subscribe(_this.topic + credentials.from, function (sdkEvent) {
            _this.onMessageReceived(sdkEvent.body);
        }); 
        _this.credentials = credentials;
        _this.stompClient.send("/app/chat-receive", {}, JSON.stringify(this.credentials));
    }, this.errorCallBack);
  };

  _listen(credentials) {
    this.stompClient.send("/app/chat-receive", {}, JSON.stringify(credentials));

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
          this._connect(this.credentials);
      }, 5000);
  }

  /**
  * Send message to sever via web socket
  * @param {*} message 
  */
  _send(message) {
      this.stompClient.send("/app/chat-send", {}, JSON.stringify(message));
  }

  onMessageReceived(body) {
      var message: Message = JSON.parse(body);
      console.log("Message Recieved from Server :: " + message.msg);
      this.chatComponent.handleMessage(message);
  }
}

  