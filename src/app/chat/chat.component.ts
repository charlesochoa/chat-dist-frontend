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

  response = "";
  content = "";
  name = "";
  email = "";
  from = "";
  to = "";
  msg = "";
  canSend = false;
  receivedMessages = []
  contacts = []
  onSubmit() 
  {
  }

  constructor(private chatService: ChatService) { }


  ngOnInit(): void 
  {
  }

  sendMessage(): void
  {
    console.log("sendingmessage in controller");
    this.chatService.sendMessage(this.from,this.to,this.msg).subscribe((data: any)=>{
      console.log(data);
      this.receivedMessages.push(this.from + ": " + this.msg);
      this.msg = "";
    })  
    
  }
  
  sign(): void
  {
    console.log("sendingmessage in controller");
    this.chatService.signUp(new User(0,this.name,this.email,"")).subscribe((data: any[])=>{
      console.log(data);
      this.contacts = data
      this.from = this.name;
      this.canSend = true;
    })  
    
  }

  receiveMessage(): void
  {
    this.chatService.receiveMessage(this.from).subscribe((data: any)=>{
      this.receivedMessages.push(data.msg);
      console.log(data);
      this.msg = "";
    })  
  }
}
