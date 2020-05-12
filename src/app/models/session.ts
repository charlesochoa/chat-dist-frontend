import { Chat } from "./chat";

export class Session {
    constructor(
        public token: string,
        public chats: Chat[],
      ) {  }
    
}
