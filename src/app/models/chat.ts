import { User } from './user';
import { Chatroom } from './chatroom';
import { Message } from './message';

export class Chat {
    constructor(
        public contact: User,
        public chatroom: Chatroom,
        public isGroup: boolean,
        public messages: Message[],
      ) {  }
}

