import { User } from './user';
import { Chatroom } from './chatroom';

export class Message {
    constructor(
      public id: number,
      public sender: User,
      public time: number,
      public content: string,
      public isFile: boolean,
      public receiver: User,
      public chatroom: Chatroom,

    ) {  }
}
