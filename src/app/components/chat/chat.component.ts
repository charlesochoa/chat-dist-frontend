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
              private sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private router: Router  )
  {
    this.fileName = ""
    this.selectedFiles = [];
    this.session = new Session("",[],[]);
    this.chatTitle= "";
    this.chatMessages= [];
    this.chat = new Chat(new User(null,"","","",""),null,null,[]);
    this.receiver = new User(0,"","","","");
    this.disconnected= true;
    this.connected=false;
    this.addingChatroom = false;
    this.username= "inseguro1";
    this.password = "12345";
    this.token = "";
    this.sendingFile = false;
    this.newChatroomName = "";
    this.newMessage = new Message(null,this.user,null,null,null,null,null);
    this.newMessageContent = "";
  }
  ngOnInit() {
    this.chatService = new ChatService(this);
    this.form = this.formBuilder.group({
      file: ['']
    });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.get('file').setValue(file);
    }
  }
  
  onSubmit() {
    const formData = new FormData();
    // console.log("this.onSubmit");
    // console.log(this.form.get('file').value!="");
    formData.append('file', this.form.get('file').value);
    this.sendingFile = true;
    // console.log("onSubmit: this.sendingFile");
    // console.log(this.sendingFile);
    this.uploadService.upload(formData).subscribe(
      (res: UploadResponse) => 
      {
        // console.log(res);
        this.uploadResponse = res;
        this.newMessageContent = this.uploadResponse.fileDownloadUri;
        this.sendMessage();
      },
      (err) => 
      {
        this.sendingFile = false;
        this.notificationService.showError( JSON.stringify(err),"Error");
        // console.log(err)
      }
    );
  }

  sign_up()
  {
    this.userService.sign_up(new User(null,this.username,null,this.password,null)).subscribe((data: User) => 
    {
      this.user = data;
      // console.log(this.result);
      this.loadDirectChats();
      this.loadGroups();
      this.chatService._connect(this.user);
      this.connected = true;
      this.disconnected = false;

    })
  }
  login()
  {
    if(this.password!= "" && this.username!=""){
      if(this.password== "admin" && this.username=="admin"){
        this.router.navigate(['/admin'])
      } else {
        this.credentials = new Credentials(this.username,this.password);
        this.userService.login(this.credentials)
  
        .subscribe((response: User) => 
        {
          // console.log(response);
          if(response!=null) 
          {
            // this.token = response["Authorization"];
            // this.chatService.set_token(this.token);
            // this.userService.set_token(this.token);
            // this.chatService.set_authorization(this.token);
            // this.userService.set_authorization(this.token);
            this.user = response;
            this.loadDirectChats();
            this.loadGroups();
            this.chatService._connect(this.user);
            this.connected = true;
            this.disconnected = false;
          }
  
        });

      }
    } else {
      this.notificationService.showError("Los campos no deben estar vacíos", "Error de ingreso");
    }
  }
  logout()
  {
    this.chatService._disconnect();
    
    this.session = new Session("",[],[]);
    this.chatTitle= "";
    this.chatMessages= [];
    this.chat = new Chat(null,null,null,[]);
    this.receiver = new User(0,"","","","");
    this.disconnected= true;
    this.connected=false;
    this.addingChatroom = false;
    this.token = "";
    this.newChatroomName = "";
    this.connected = false;
    this.disconnected = true;
  }
// ---------- LOADING SESSION -------------- START
  loadDirectChats()
  {
    this.userService.get_all_users().subscribe((cs: User[]) => 
    {
      // console.log("LoadContacts Response:");
      // console.log(cs);
      cs.forEach((c: User) =>
      {
        if(c.username != this.credentials.username)
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
    this.userService.get_all_chatrooms(this.user).subscribe((chatrooms: any) => 
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
    // console.log("Trying to send a message");
    // console.log("sendMessage: this.sendingFile");
    // console.log(this.sendingFile);
    var date = new Date();
    if(this.newMessageContent!= "" || this.sendingFile)
    {
      var newM = new Message(null,this.user,date.getTime(),this.newMessageContent,this.sendingFile!=true,this.chat.contact,this.chat.chatroom);
      // console.log("Trying to send message:");
      // console.log(newM);
      this.userService.send_message(newM).subscribe(r => {
        // console.log(r);
      })
      this.chat.messages.push(newM);
      this.newMessageContent = "";
      this.sendingFile = false;
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
  
  addNewChat()
  {
    this.addingChatroom = true;
  }

  cancelAddNewChat()
  {
    this.addingChatroom = false;
  }

  createNewGroup()
  {
    if(this.newChatroomName!="")
    {
      this.userService.create_group(this.user,new Chatroom(null,this.user,null,this.newChatroomName,null)).subscribe(r => 
        {
          // console.log("CREATE NEW GROUP RESPONSE");
          // console.log(r);
          this.session.groups = [];
          this.loadGroups();
          this.newChatroomName = ""
          this.addingChatroom = false;
          this.notificationService.showSuccess("¡Grupo creado exitosamente!","");

        });
    }
    // console.log("TODO: Going to create: ");
    // console.log(new Chatroom(null,this.user,null,this.newChatroomName,null));
  }

  addContactToGroup(contact: User)
  {
    if(this.chat.chatroom!=null){
      this.userService.add_user_to_group(contact,this.chat.chatroom).subscribe(r =>{
        // console.log(r);
        this.loadGroups();
      })
    }
  }

  downloadFile(message: Message)
  {
    // console.log(message);
  }
  
  handleMessage(message: Message)
  {
    // console.log(message);
    
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

    } else
    {
      
      this.notificationService.showSuccess(message.content,"Admin:");
    }
    
  }
  
}
