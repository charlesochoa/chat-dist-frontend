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
import { group } from '@angular/animations';
import { MessageType } from 'src/app/models/message-type';


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
  adminMessages: Message[];

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
    this.adminMessages = [];
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
    this.cancelAddNewChat();
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
      cs.forEach((c: User) =>
      {
        if(c.username != this.user.username)
          this.session.chats.push(new Chat(c,null,false,[]));
      })
    })
  }
  loadDirectMessages()
  {
    this.userService.get_all_direct_messages(this.user).subscribe((allDirMessages: Message[]) => 
    {
      allDirMessages.forEach(m => 
      {
        this.session.chats.forEach(c => 
        {
          if(c.contact.username == m.receiver.username || c.contact.username == m.sender.username)
            c.messages.push(m);
        })
      })
    });
  }
  loadGroups()
  {
    this.userService.get_my_chatrooms(this.user).subscribe((chatrooms: any) => 
    {
      chatrooms.forEach((chatroom: Chatroom) => 
      {
          this.session.groups.push(new Chat(null,chatroom,true,[]));
      })
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

  showAdminMessages()
  {
    this.cancelAddNewChat();
    this.chatTitle = "ChatDist Sistema";
    this.chat = null;
    this.chatMessages = this.adminMessages;
    this.newMessageContent = "";
  }
  changeChat(chat: Chat)
  {
    this.cancelAddNewChat();
    if(chat.isGroup)
    {
      this.chatTitle = "Grupo: " + chat.chatroom.name;
    } else 
    {
      this.chatTitle = "Para: " + chat.contact.username;

    }
    this.chat = chat
    this.chatMessages = chat.messages;
    this.newMessageContent = "";
  }

  sendMessage()
  {
    this.cancelAddNewChat();
    var date = new Date();
    if(this.newMessageContent!= "" || this.sendingFile)
    {
      var newM = new Message(null,this.user,date.getTime(),this.newMessageContent,this.sendingFile==true?MessageType.FILE:MessageType.MESSAGE,this.chat.contact,this.chat.chatroom,this.fileSize);
      console.log("MESSAGE SENT:");
      console.log(newM);
      this.userService.send_message(newM).subscribe(r => {
        this.chat.messages.push(newM);
        console.log(this.chat.messages);
        this.newMessageContent = "";
        this.newMessageLength = 0;
        this.fileSize = null;
        this.sendingFile = false;
      })
    }
    else 
      this.notificationService.showError("No ha colocado nada para enviar","Error enviando");
  }
  inGroup(c: User) {
    if(this.chat!=null)
      if(this.chat.isGroup)
        return this.chat.chatroom.users.find(x => x.username == c.username)!=undefined;
      else
        return this.chat.contact.username == c.username;
    return false;
  }
  notInGroup(c: User) {
    if(this.chat!=null)
    {
      if(this.chat.isGroup)
        return this.chat.chatroom.users.find(x => x.username == c.username)==undefined;
      else
        return this.chat.contact.username != c.username;
    } 
    return true;
  }
  notInvited(c: User) {
    if(this.chat!=null)
      if(this.chat.isGroup && this.chat.chatroom.admin.username == this.user.username)
        return this.chat.chatroom.users.find(x => x.username == c.username)==undefined;
    return false;
  }

  invited(c: User) {
    if(this.chat!=null)
      if(this.chat.isGroup && this.chat.chatroom.admin.username == this.user.username)
        return this.chat.chatroom.users.find(x => x.username == c.username)!=undefined;
    return false;
  }
  
  addNewChat() { this.addingChatroom = true; }

  cancelAddNewChat() 
  { 
    this.addingChatroom = false; 
    this.newChatroomName= "";
  }

  createNewGroup()
  {
    if(this.newChatroomName!="")
    {
      this.userService.create_group(this.user,new Chatroom(null,this.user,null,this.newChatroomName,null)).subscribe((newGroup: Chatroom) => 
        {
          this.notificationService.showSuccess("¡Grupo creado exitosamente!","");
          this.session.groups.push(new Chat(null,newGroup,true,[]));
          this.cancelAddNewChat();
        });
    }
  }

  deleteGroup(g: Chatroom)
  {
    var date = new Date();
    var addReport = new Message(null,null,date.getTime(),null,MessageType.REMOVE,null,g,null);
    this.userService.send_group_message(addReport).subscribe(r => {
      this.userService.delete_group(g).subscribe(r2 => {
        // this.notificationService.showSuccess("El grupo '" + g.name + "' ha sido eliminado","");
      })
    });
  }

  addContactToGroup(contact: User)
  {
    if(this.chat.chatroom!=null){
      
    var date = new Date();
    var addReport = new Message(null,contact,date.getTime(),null,MessageType.ADD,null,this.chat.chatroom,null);
    this.userService.add_user_to_group(contact,this.chat.chatroom).subscribe(r =>{
      this.userService.send_message(addReport).subscribe(res => {
        // this.notificationService.showSuccess("El usuario " + contact.username + " ha sido agregado al grupo.","");
        // this.chat.chatroom.users.push(contact);
      })
    })
    }
  }
  removeContactFromGroup(contact: User)
  {
    if(this.chat.chatroom!=null){
      var date = new Date();
      var addReport = new Message(null,contact,date.getTime(),null,MessageType.REMOVE,null,this.chat.chatroom,null);
      this.userService.send_message(addReport).subscribe(res => {
        this.userService.remove_user_from_group(contact,this.chat.chatroom).subscribe(r =>{
          var contactIndex = this.chat.chatroom.users.findIndex(x => { return x.username == contact.username});
          console.log(this.chat.chatroom.users);
          console.log(contactIndex == -1 ? "user not found": "user found");
          if(contactIndex>-1){
            // this.chat.chatroom.users.splice(contactIndex,1);
          }
          // this.notificationService.showSuccess("El usuario " + contact.username + " ha sido removido del grupo.","");
        })
      })
    }

  }


  onMessageChange(event: any) {
    this.cancelAddNewChat();
    this.newMessageLength = event.length;
  }
  
  handleMessage(message: Message)
  {
    console.log("Message received!");
    console.log(message);
    console.log("Initial groups:");
    console.log(this.session.groups);
    if(message.sender != null && (message.contentType == MessageType.MESSAGE || message.contentType == MessageType.FILE))
    {
      if(message.sender!= null && message.sender.username != this.user.username){
        console.log("Sender != null and is not me");
        if(message.receiver!=null && message.receiver.username==this.user.username){
          console.log("Receiver != null and I am de receiver");
          this.session.chats.forEach(chat => {
            if(chat.contact.username == message.sender.username){
              console.log("Message appended to my view");
              chat.messages.push(message);
              this.notificationService.showSuccess(message.content,message.sender.username);
            }
          });
        } else if(message.chatroom!= null){
          console.log("Chatroom != null");
          this.session.groups.forEach(group => {
            if(group.chatroom.name == message.chatroom.name){
              group.messages.push(message);
              console.log("Chatroom is found so message is appended to my view");
              this.notificationService.showSuccess(message.content,message.chatroom.name + ": " + message.sender.username);
            }
          });
        } else if(message.receiver==null && message.chatroom==null){
          this.adminMessages.push(message);
          this.notificationService.showSuccess(message.content,"ChatDist Sistema:");
        }
      }
    } else if (message.contentType == MessageType.ADD) 
    {
      console.log("A user is going to be added to Chatroom");
      if(message.sender.username == this.user.username)
      {
        console.log("I am that user");
        var index = this.session.groups.findIndex(x => {return x.chatroom.id == message.chatroom.id});
        if(index == -1)
        {
          this.userService.get_all_group_messages(message.chatroom).subscribe((gmgs: Message[]) =>
          {
            this.session.groups.push(new Chat(null,message.chatroom,true,gmgs));
            this.notificationService.showInfo("Usted ha sido invitado al grupo: " + message.chatroom.name,"");
          })
        }
        
      } else {
        console.log("The user is: " + message.sender.username);
        var index = this.session.groups.findIndex(x => {return x.chatroom.id == message.chatroom.id});
        if(index > -1)
        { 
          var indexUser = this.session.groups[index].chatroom.users.findIndex(x => {return x.username == message.sender.username});
          if(indexUser == -1)
          {
            this.session.groups[index].chatroom.users.push(message.sender);
            
          }
          this.notificationService.showInfo(message.sender.username + " ha sido agregado al grupo: " + message.chatroom.name,"");
        }
      }
    } else if (message.contentType == MessageType.REMOVE)
    { 
      if(message.sender == null)
      {
        var index = this.session.groups.findIndex(x => {return x.chatroom.id == message.chatroom.id});
        if(index>-1){
          this.session.groups.splice(index,1);
          if(this.chatTitle == "Grupo: " + message.chatroom.name){
            this.chatTitle = "";
            this.chatMessages = [];
          }
          this.notificationService.showInfo("El grupo '" + message.chatroom.name + "' ha sido eliminado","");
        }
      }
      else if(message.sender.username == this.user.username)
      {
        console.log("A user is going to be removed from Chatroom");
        console.log("I am that user");
        var index = this.session.groups.findIndex(x => {return x.chatroom.id == message.chatroom.id});
        if(index>-1){
          this.session.groups.splice(index,1);
          if(this.chatTitle == "Grupo: " + message.chatroom.name){
            this.chatTitle = "";
            this.chatMessages = [];
          }
          this.notificationService.showInfo("Usted ha sido removido del grupo: " + message.chatroom.name,"");
        }
      } 
      else
      {
        console.log("A user is going to be removed from Chatroom");
        console.log("The user is: " + message.sender.username);
         var index = this.session.groups.findIndex(x => {return x.chatroom.id == message.chatroom.id});
         if(index > -1)
         {
          var indexUser = this.session.groups[index].chatroom.users.findIndex(x => {return x.username == message.sender.username});
          if(indexUser > -1)
          {
            this.session.groups[index].chatroom.users.splice(indexUser,1);
            this.notificationService.showInfo(message.sender.username + " ha sido removido del grupo: " + message.chatroom.name,"");
          }
         }
      }
    } 
    console.log("Resulting groups");
    console.log(this.session.groups);
  }
  
}
