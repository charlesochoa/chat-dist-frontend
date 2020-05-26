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
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  
  session: Session;
  chatService: ChatService;
  chat: Chat;
  newMessageContent: string;
  newMessageLength: number;
  result: User;
  user: User;
  newChatroomName: string;
  token: string;
  receiver: User;
  chatTitle: string;
  chatMessages: Message[];
  addingChatroom: boolean;
  selectedFiles: File[];
  form: FormGroup;
  error: string;
  sendingFile: boolean;
  fileName: string;
  fileSize: number;
  fileUrl: SafeResourceUrl;
  uploadResponse: UploadResponse;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService, 
              private notificationService: NotificationService,
              private uploadService: UploadService,
              private sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private router: Router  )
  {
    this.fileName = ""
    this.selectedFiles = [];
    this.session = new Session("",[],[]);
    this.chatTitle= "";
    this.chatMessages= [];
    this.chat = new Chat(new User(null,"","","","",[]),null,null,[]);
    this.receiver = new User(0,"","","","",[]);
    this.addingChatroom = false;
    this.sendingFile = false;
    this.newChatroomName = "";
    this.newMessageContent = "";
    this.newMessageLength = 0;
    this.user = new User(null,null,null,null,null,null);
  }
  ngOnInit() {
    this.chatService = new ChatService(this);
    this.form = this.formBuilder.group({
      file: ['']
    });
    this.token = this.route.snapshot.paramMap.get('token');

    if(this.route.snapshot.paramMap.get('username')==undefined || this.token==undefined){
      this.router.navigate(['/login']);
    }
    this.uploadService.set_authorization(this.token);
    this.chatService.set_authorization(this.token);
    this.userService.set_authorization(this.token);
    this.userService.get_profile(this.route.snapshot.paramMap.get('username')).subscribe((u: any) => {
                    this.user = u;
                    this.chatService._connect(this.user);
                    this.loadDirectChats();
                    this.loadGroups();
                  })
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.get('file').setValue(file);
    }
  }
  
  onSubmit() {
    const formData = new FormData();
    formData.append('file', this.form.get('file').value);
    this.sendingFile = true;
    this.uploadService.upload(formData).subscribe(
      (res: UploadResponse) => 
      {
        this.uploadResponse = res;
        this.newMessageContent = this.uploadResponse.fileDownloadUri;
        this.fileSize = this.uploadResponse.size;
        this.sendMessage();
      },
      (err) => 
      {
        this.sendingFile = false;
        this.notificationService.showError( JSON.stringify(err),"Error");
      }
    );
  }

  logout()
  {
    this.chatService._disconnect();
    
    this.router.navigate(['/login']);
  }
// ---------- LOADING SESSION -------------- START
  loadDirectChats()
  {
    this.userService.get_all_contacts().subscribe((cs: User[]) => 
    {
      // console.log("LoadContacts Response:");
      // console.log(cs);
      cs.forEach((c: User) =>
      {
        if(c.username != this.user.username)
        {
          this.session.chats.push(new Chat(c,null,false,[]));
        }
      })
      // this.loadDirectMessages();
      
    })
  }
  listen(){
    // this.chatService._listen(this.user);
  }
  loadDirectMessages()
  {
    this.userService.get_all_direct_messages(this.user).subscribe((allDirMessages: Message[]) => 
    {
      // // console.log("allDirMessages");
      // // console.log(allDirMessages);
      allDirMessages.forEach(m => 
      {
        this.session.chats.forEach(c => 
        {
          if(c.contact.username == m.receiver.username || c.contact.username == m.sender.username)
          {
            c.messages.push(m);
          }
        })
      })
    });
  }
  loadGroups()
  {
    this.userService.get_my_chatrooms(this.user).subscribe((chatrooms: any) => 
    {
      // console.log("chatrooms:");
      // console.log(chatrooms);
      chatrooms.forEach((chatroom: Chatroom) => 
      {
          this.session.groups.push(new Chat(null,chatroom,true,[]));
      })
      // console.log("this.session.groups");
      // console.log(this.session.groups);
      
      this.loadGroupMessages();

    })
  }
  loadGroupMessages()
  {
    this.session.groups.forEach((g: Chat) =>
    {
      this.userService.get_all_group_messages(g.chatroom).subscribe((gmgs: Message[]) =>
      {
        g.messages = gmgs;
      })
    })
  }
// ---------- LOADING SESSION -------------- END


  changeChat(chat: Chat)
  {
    // console.log(chat);
    if(chat.isGroup)
    {
      this.chatTitle = "Group: " + chat.chatroom.name;
    } else 
    {
      this.chatTitle = "To: " + chat.contact.username;

    }
    // console.log(this.chatTitle);
    this.chat = chat
    this.chatMessages = chat.messages;
    this.newMessageContent = "";
  }

  sendMessage()
  {
    var date = new Date();
    if(this.newMessageContent!= "" || this.sendingFile)
    {
      var newM = new Message(null,this.user,date.getTime(),this.newMessageContent,this.sendingFile!=true,this.chat.contact,this.chat.chatroom,this.fileSize);
      this.userService.send_message(newM).subscribe(r => {
        this.chat.messages.push(newM);
        this.newMessageContent = "";
        this.newMessageLength = 0;
        this.fileSize = null;
        this.sendingFile = false;
      })
    }
    else 
    {
      this.notificationService.showError("No ha colocado nada para enviar","Error enviando");
    }
  }
  notInvited(c: User) {
    if(this.chat!=null)
    {
      if(this.chat.isGroup && this.chat.chatroom.admin.username == this.user.username)
      {
        return this.chat.chatroom.users.find(x => x.username == c.username)==undefined;
      }
    }
    return false;
  }
  
  addNewChat() { this.addingChatroom = true; }

  cancelAddNewChat() { this.addingChatroom = false; }

  createNewGroup()
  {
    if(this.newChatroomName!="")
    {
      this.userService.create_group(this.user,new Chatroom(null,this.user,null,this.newChatroomName,null)).subscribe(r => 
        {
          this.session.chats = [];
          this.loadDirectChats();
          this.session.groups = [];
          this.loadGroups();
          this.newChatroomName = ""
          this.addingChatroom = false;
          this.notificationService.showSuccess("¡Grupo creado exitosamente!","");

        });
    }
  }

  addContactToGroup(contact: User)
  {
    if(this.chat.chatroom!=null){
      this.userService.add_user_to_group(contact,this.chat.chatroom).subscribe(r =>{
        this.session.groups = [];
        this.loadGroups();
      })
    }
  }


  onMessageChange(event: any) {
    this.newMessageLength = event.length;
  }
  
  handleMessage(message: Message)
  {
    if(message.receiver!= null)
    {
      this.session.chats.forEach(c => 
      {
        if(c.contact.username == message.sender.username)
        {
          c.messages.push(message);
          this.notificationService.showSuccess(message.content,message.sender.username);
        }
      })
    } else if(message.chatroom!= null)
    {
      this.session.groups.forEach(g => 
      {
        if(g.chatroom.name == message.chatroom.name)
        {
          g.messages.push(message);
          this.notificationService.showSuccess(message.content,message.chatroom.name);
        }
        
      })

    } else if(message.sender!=null && message.sender.username == "admin")
    {
      this.notificationService.showSuccess(message.content,"Admin:");
    }
    
  }
  
}
