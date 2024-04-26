// import classes
import { Message } from './message.class';
import { User } from './user.class';

export class DirektMessage {
  users: User[];
  id: string;
  messages: Message[];

  constructor(obj?: any, id?: string) {
    this.users = obj ? obj.users : '';
    this.id = id || '';
    this.messages = obj ? obj.messages : '';
    this.sortMessagesChronologically();
  }

  sortMessagesChronologically() {
    if (this.messages) {
      this.messages.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  }

  toCleanBEJSON() {
    return {
      userIds: this.users.map((user) => user.id),
    };
  }
}
