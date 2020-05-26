import { Injectable } from '@angular/core';
import { AdminComponent } from '../components/admin/admin.component';
import { ConfigService } from '../config/config.service';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { User } from '../models/user';
import { Message } from '../models/message';
import { Statistics } from '../models/statistics';

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

  _connect_admin(admin: User) {
    console.log("Initialize WebSocket Connection");
    let ws = new SockJS(this.config.WS_SERVER);
    this.stompClient = Stomp.over(ws);
    console.log(this.stompClient);
    const _this = this;
    _this.stompClient.connect(this.tokenHeader, function (frame) {
      console.log(frame)
      _this.stompClient.subscribe(_this.config.topic + "admin/statistics", function (sdkEvent) {
          _this.onStatisticReceived(sdkEvent.body);
      }, this.tokenHeader);
      _this._listen(admin);
      _this._listenForStatistics(admin);

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
      console.log("errorCallBack -> " + error);
      setTimeout(() => {
      }, 5000);
  }

  /**
  * Send message to sever via web socket
  * @param {*} message 
  */
 _listenForStatistics(admin: User) {
  console.log("Try to start listening websockets Statistics")
    this.stompClient.send("/app/receive-statistics", this.tokenHeader, JSON.stringify(admin));
}

  /**
  * Start listener of messages in server
  * @param {*} user 
  */
 _listen(user) {
  console.log("Try to start listening websockets")
    this.stompClient.send("/app/receive-message", this.tokenHeader, JSON.stringify(user));
}


  onStatisticReceived(body: string) {
      var statistics: Statistics = JSON.parse(body);
      console.log("Statistics update from Server :: " + JSON.stringify(statistics));
      this.adminComponent.updateStatistics(statistics);
  }
}
