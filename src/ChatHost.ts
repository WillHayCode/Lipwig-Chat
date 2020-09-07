import { LipwigHost, User } from 'lipwigjs';
import { ChatUser } from './ChatUser';

type UserMap = {
  [key:string]: ChatUser;
};

type Callback = (user: ChatUser, message: string) => void;
type CallbackMap = { 
  callback: Callback,
  regex: RegExp,
  block: boolean
};

export class ChatHost {
  private host: LipwigHost;
  private users: UserMap;
  private callbacks: CallbackMap[]

  constructor(host: LipwigHost) {
    this.host = host;
    this.users = {};
    this.callbacks = [];
    const users = host.getUsers();
    for (let userid in users) {
      const user = users[userid];
      const chatUser = new ChatUser(user);
      this.users[userid] = chatUser;
      user.on('lw-chat-setname', chatUser.setName); //TODO: Check if name is taken here
    }

    this.host.on('lw-chat-message', this.handle, { object: this });
  }

  private handle(user: User, message: string): void {
    let block = false;
    const chatUser = this.users[user.id];
    this.callbacks.forEach((callbackMap: CallbackMap) => {
      const callback = callbackMap.callback;
      const pattern = callbackMap.regex;
      if (message.match(pattern)) {
        callback(chatUser, message); //TODO: There's no context handling for this
        block = callbackMap.block && block;
      }
    });
    if (!block) {
      this.sendToAll(chatUser.name, message);
    }
  }

  public on(match: RegExp, callback: Callback, blocking: boolean = false): void {
    const map: CallbackMap = {
      regex: match,
      callback: callback,
      block: blocking
    };

    this.callbacks.push(map)
  }

  public onAll(callback: Callback, blocking: boolean = false) {
    const regex = /.*/; // Match all messages (hopefully)
    this.on(regex, callback, blocking);
  }

  public sendToAll(name: string, message: string) {
    for (let userid in this.users) {
      const user = this.users[userid];
      user.send(name, message);
    }
  }
}
