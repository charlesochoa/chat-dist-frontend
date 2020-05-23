
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Message }    from '../../models/message';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { Credentials } from '../../models/credentials';
import { Timestamp } from 'rxjs/internal/operators/timestamp';
import { HttpResponse, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Session } from '../../models/session';
import { Chat } from 'src/app/models/chat';
import { NotificationService } from 'src/app/services/notification.service';
import { Chatroom } from 'src/app/models/chatroom';
import { UploadService } from 'src/app/services/upload.service';
import { of } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UploadResponse } from 'src/app/models/upload-response';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  
  session: Session;
  chatService: ChatService;
  chat: Chat;
  credentials: Credentials;
  newMessage : Message;
  newMessageContent: string;
  result: User;
  user: User;
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
  uploadResponse = new UploadResponse("","","",null);

  constructor(private formBuilder: FormBuilder,
              private userService: UserService, 
              private notificationService: NotificationService,
              private uploadService: UploadService,
              private route: ActivatedRoute,
              private router: Router,
              private sanitizer: DomSanitizer)
  {
    this.fileName = ""
    this.selectedFiles = [];
    this.session = new Session("",[],[]);
    this.chatTitle= "";
    this.chatMessages= [];
    this.chat = new Chat(new User(null,"","","","",[]),null,null,[]);
    this.receiver = new User(0,"","","","",[]);
    this.disconnected= true;
    this.username = "admin"
    this.password = "admin"
    this.connected=false;
    this.addingChatroom = false;
    this.token = "";
    this.sendingFile = false;
    this.newChatroomName = "";
    this.newMessage = new Message(null,this.user,null,null,null,null,null);
    this.newMessageContent = "";
  }
  ngOnInit() {
  }


  sign_up()
  {
    this.userService.sign_up(new User(null,this.username,null,this.password,null,[])).subscribe((data: any) => 
    {
      console.log(data);
      this.notificationService.showSuccess("Usuario creado exitosamente","¡Enhorabuena!");

    })
  }
  login()
  {
    if(this.password!= "" && this.username!=""){
      this.credentials = new Credentials(this.username,this.password);
      this.userService.login(this.credentials)

      .subscribe((response: User) => 
      {
        console.log(response);
        if(response!=null) 
        {
          this.notificationService.showSuccess("","¡Enhorabuena!")
          this.token = response["Authorization"];
          console.log(this.token);
          if(this.username=="admin"){
            this.router.navigate(['/admin',{ token: this.token , username: this.username}])
          } else {
            this.router.navigate(['/chat',{ token: this.token , username: this.username}])
          }
        }

      });
    } else {
      this.notificationService.showError("Los campos no deben estar vacíos", "Error de ingreso");
    }
  }
}
