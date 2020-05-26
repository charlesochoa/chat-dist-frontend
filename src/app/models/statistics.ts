export class Statistics {

    constructor(
        public activeChatrooms: number,
        public activeUsers: number,
        public messagesPerMinute: number,
        public bytesPerMinute: number,
        public messagesLastHour: number,
        public messagesLastDay: number,
        public messagesAllTime: number,
        public bytesLastHour: number,
        public bytesLastDay: number,
        public bytesAllTime: number,
      ) {  }

}
