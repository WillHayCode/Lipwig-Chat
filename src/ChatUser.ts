import { User } from 'lipwigjs';

export class ChatUser {
  private user: User;
  public name: string;
  constructor(user: User) {
    this.user = user;
    this.name = '';
  }

  public setName(name: string) {
    this.name = name;
  }

  public send(name: string, message: string) {
    this.user.send('lw-chat-message', name, message);
  }
}
