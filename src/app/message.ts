import { User } from './user';

export class Message {
    constructor(
      public id: number,
      public sender: User,
      public receiver: User,
      public content: string
    ) {  }
}
