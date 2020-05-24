import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Message } from 'src/app/models/message';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { UploadService } from 'src/app/services/upload.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { Chat } from 'src/app/models/chat';
import { Credentials } from 'src/app/models/credentials';
import { User } from 'src/app/models/user';
import { UploadResponse } from 'src/app/models/upload-response';
import { AdminService } from 'src/app/services/admin.service';
import { Session } from 'src/app/models/session';
import { Chatroom } from 'src/app/models/chatroom';
import { Statistics } from 'src/app/models/statistics';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  message: string;
  
  session: Session;
  statistics: Statistics;
  adminService: AdminService;
  chat: Chat;
  credentials: Credentials;
  newMessage : Message;
  newMessageContent: string;
  result: User;
  user: User;
  users: User[];
  chatrooms: Chatroom[];
  newChatroomName: string;
  token: string;
  password: string;
  receiver: User;
  chatTitle: string;
  chatMessages: Message[];
  disconnected: boolean;
  connected: boolean;
  addingChatroom: boolean;
  username: string;
  selectedFiles: File[];
  form: FormGroup;
  error: string;
  sendingFile: boolean;
  fileName: string;
  fileUrl: SafeResourceUrl;
  inspected: string;
  uploadResponse = new UploadResponse("","","",null);
  constructor(private formBuilder: FormBuilder,
              private userService: UserService, 
              private notificationService: NotificationService,
              private uploadService: UploadService,
              private sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private router: Router  ) 
              {
                this.statistics = new Statistics(null,null,null,null);
              }

  ngOnInit(): void {
    this.adminService = new AdminService(this);
    this.form = this.formBuilder.group({
      file: ['']
    });
    this.token = this.route.snapshot.paramMap.get('token');
    this.username = this.route.snapshot.paramMap.get('username');

    if(this.username==undefined || this.token==undefined){
      this.router.navigate(['/login']);
    }
    this.adminService.set_authorization(this.token);
    this.userService.set_authorization(this.token);
    this.adminService._connect_admin();
  }
  
  sendMessage()
  {
    var date = new Date();
    this.userService.send_message_to_all(new Message(null,null,date.getTime(),this.message,true,null,null,null))
    .subscribe(r => {
      console.log(r);
    })
  }
  
  logout()
  {
    this.adminService._disconnect();
    
    this.router.navigate(['/login']);
  }

  changeUser(user: User)
  {

  }

  changeGroup(group: Chatroom)
  {

  }

  deleteUser(user: User)
  {

  }


  loadDirectChats()
  {
    this.userService.get_all_contacts().subscribe((cs: User[]) => 
    {
      cs.forEach((c: User) =>
      {
        if(c.username != this.user.username)
        {
          this.session.chats.push(new Chat(c,null,false,[]));
        }
      })
    })
  }

  loadGroups()
  {
    this.userService.get_all_chatrooms().subscribe((chatrooms: any) => 
    {
      chatrooms.forEach((chatroom: Chatroom) => 
      {
          this.chatrooms.push(chatroom);
      })
    })
  }

  updateStatistics(statistics: Statistics){
    this.statistics = statistics;
  }


}
