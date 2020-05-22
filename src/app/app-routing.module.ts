import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { ChatroomComponent } from './components/chatroom/chatroom.component';
import { AdminComponent } from './components/admin/admin.component';


const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full'},
  { path: 'chat', component: ChatComponent},
  { path: 'new-chat', component: ChatroomComponent},
  { path: 'admin', component: AdminComponent}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
