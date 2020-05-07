import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Message }    from '../message';
import { User } from '../user';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatService: ChatService;
  greeting = "asdfasdf";
  msgs = [];
  username: string;
  password: string;
  credentials: Message;
  disconnected= true;
  connected=false;
  newMessage : string;
  ngOnInit() {
    this.chatService = new ChatService(this);
  }

  connect(){
    this.chatService._connect(new Message(this.username,"",this.password));
    this.connected = true;
    this.disconnected = false;
  }

  disconnect(){
    this.chatService._disconnect();
    this.connected = false;
    this.disconnected = true;
  }

  sendMessage(){
    this.chatService._send(new Message(this.username,"",this.password));
  }

  handleMessage(message: Message){
    this.msgs.push(message);
  }
  
}
