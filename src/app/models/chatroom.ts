import { User } from './user';

export class Chatroom {
    constructor(
        public id: number,
        public admin: User,
        public bindingName: string,
        public name: string,
        public users: User[],
      ) {  }
}
