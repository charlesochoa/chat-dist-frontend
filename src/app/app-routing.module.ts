import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { ChatroomComponent } from './components/chatroom/chatroom.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'login', component: LoginComponent},
  { path: 'chat', component: ChatComponent},
  { path: 'new-chat', component: ChatroomComponent},
  { path: 'admin', component: AdminComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
