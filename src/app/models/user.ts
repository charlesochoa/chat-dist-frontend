import { Chatroom } from './chatroom';
import { Message } from './message';

export class User {
    
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public password: string,
    public bindingName: string,
    public roles: string[],
  ) {  }
    
}
