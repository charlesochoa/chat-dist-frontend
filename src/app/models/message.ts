import { User } from './user';
import { Chatroom } from './chatroom';
import { MessageType } from './message-type';

export class Message {
    constructor(
      public id: number,
      public sender: User,
      public time: number,
      public content: string,
      public contentType: MessageType,
      public receiver: User,
      public chatroom: Chatroom,
      public bytes: number,
    ) {  }
}
