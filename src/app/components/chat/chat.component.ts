import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { Message }    from '../models/message';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { Credentials } from '../models/credentials';
import { Timestamp } from 'rxjs/internal/operators/timestamp';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatService: ChatService;
  allMsgs = [];
  msgs = [];
  username= "inseguro1";
  // username= "gabriel";
  password = "12345";
  credentials: Credentials;
  disconnected= true;
  connected=false;
  newMessage : string;
  result: User;
  contacts: User[];
  receiver = new User(0,"","","","");
  user: User;
  token = "";

  constructor(private userService: UserService)
  {

  }
  ngOnInit() {
    this.chatService = new ChatService(this);
  }

  sign_up()
  {
    this.userService.sign_up(new User(0,this.username,"",this.password,"")).subscribe((data: User) => {
      this.result = data;
      console.log(this.result);

    })
  }

  login() 
  
  {
    this.credentials = new Credentials(this.username,this.password);
    this.userService.login(this.credentials)
    .subscribe(response => {
      console.log(response);
      if(response!=null) {
        // this.token = response["Authorization"];
        // this.chatService.set_token(this.token);
        // this.userService.set_token(this.token);
        // this.chatService.set_authorization(this.token);
        // this.userService.set_authorization(this.token);
        
        this.contacts = response;
        this.contacts.forEach(contact => {
          if(contact.username == this.credentials.username){
            this.user = contact;
            this.contacts.splice(this.contacts.indexOf(contact),1);
          }
        })
        this.chatService._connect(this.user);
        this.connected = true;
        this.disconnected = false;

      }
    });

  }

  changeChat(contact: User)
  {
    console.log(contact);
    this.receiver = contact;
    this.msgs = [];
    this.newMessage = "";
  }

  disconnect(){
    this.chatService._disconnect();
    this.connected = false;
    this.disconnected = true;
  }

  sendMessage(){
    this.chatService._send(new Message(0,this.user,0,this.newMessage,false,this.receiver,null));
    this.msgs.push(new Message(0,this.user,0,this.newMessage,false,this.receiver,null));
    this.newMessage = "";
  }

  handleMessage(message: Message){
    console.log(message);
    this.msgs.push(message);
  }
  
}
