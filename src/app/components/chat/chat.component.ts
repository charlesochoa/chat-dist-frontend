import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Message }    from '../../models/message';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Credentials } from '../../models/credentials';
import { Timestamp } from 'rxjs/internal/operators/timestamp';
import { HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Session } from '../../models/session';
import { Chat } from 'src/app/models/chat';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  session: Session;
  chatService: ChatService;
  chat = new Chat(new User(null,"","","",""),null,null,[]);
  msgs = [];
  username= "inseguro1";
  password = "12345";
  credentials: Credentials;
  disconnected= true;
  connected=false;
  newMessage : string;
  result: User;
  receiver = new User(0,"","","","");
  user: User;
  token = "";

  constructor(private userService: UserService)
  {
    this.session = new Session("",[]);
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
    .subscribe((response: User[]) => {
      console.log(response);
      if(response!=null) {
        // this.token = response["Authorization"];
        // this.chatService.set_token(this.token);
        // this.userService.set_token(this.token);
        // this.chatService.set_authorization(this.token);
        // this.userService.set_authorization(this.token);
        
        response.forEach(contact => {
          if(contact.username == this.credentials.username){
            this.user = contact;
          } else {
            this.session.chats.push(new Chat(contact,null,false,[]));
          }
        })
        this.userService.get_all_direct_messages(this.user).subscribe((allDirMessages: Message[]) => {
          console.log("allDirMessages");
          console.log(allDirMessages);
          allDirMessages.forEach(m => {
            this.session.chats.forEach(c => {
              if(c.contact.username == m.receiver.username || c.contact.username == m.sender.username)
              {
                c.messages.push(m);
              }
            })
          })
        });
        this.chatService._connect(this.user);
        this.connected = true;
        this.disconnected = false;

      }
    });

  }

  getContactMessages(contact: User){
    this.session.chats.forEach(c => {
      if(c.contact.username == contact.username){
        return c.messages;
      }
    })
  }

  changeChat(chat: Chat)
  {
    console.log(chat);
    this.receiver = chat.contact;
    this.chat = chat;
    this.newMessage = "";
  }

  disconnect(){
    this.chatService._disconnect();
    this.session = null;
    this.connected = false;
    this.disconnected = true;
  }

  sendMessage(){
    var date = new Date();
    console.log(date.getTime());
    var newDirect = new Message(null,this.user,date.getTime(),this.newMessage,true,this.receiver,null,null);
    console.log("newDirect");
    console.log(newDirect);
    this.chatService._send(newDirect);
    this.msgs.push(newDirect);
    this.newMessage = "";
  }

  handleMessage(message: Message){
    console.log(message);
    this.msgs.push(message);
  }
  
}
