import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Message } from 'src/app/models/message';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  message: string;
  constructor(private userService: UserService) { }

  ngOnInit(): void {
  }
  
  sendMessage()
  {
    var date = new Date();
    this.userService.send_message_to_all(new Message(null,null,date.getTime(),this.message,true,null,null))
    .subscribe(r => {
      console.log(r);
    })
  }

}
