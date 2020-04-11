import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Message }    from '../message';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  response = "";
  content = "";
  model = new Message(1,"","","");
  receivedMessages = []
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
    this.chatService.sendMessage(this.model).subscribe((data: Message)=>{
      console.log(data);
      this.receivedMessages.push(data.from + ": " + data.msg);
      this.model.msg = "";
    })  
    
  }

  receiveMessage(): void
  {
    this.chatService.receiveMessage(this.model.from).subscribe((data: Message)=>{
      this.receivedMessages.push(data.msg);
      console.log(data);
      this.model.msg = "";
    })  
  }
  get diagnostic() 
  { 
    return JSON.stringify(this.model); 
  }

}
