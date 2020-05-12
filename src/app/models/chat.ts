import { User } from './user';
import { Chatroom } from './chatroom';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

export class Chat {
    constructor(
        public contact: User,
        public chatroom: Chatroom,
        public messages: Message[],
      ) {  }
}
