import { LipwigClient } from 'lipwigjs';

type Callback = (user: string, message: string) => void;
type CallbackMap = { 
  callback: Callback,
  regex: RegExp,
};

export class ChatClient {
  private client: LipwigClient;
  private name: string;
  private callbacks: CallbackMap[]

  constructor(client: LipwigClient, name: string) {
    this.client = client;
    this.name = name;
    this.callbacks = [];
    client.send('lw-chat-setname', this.name);
    client.on('lw-chat-setname', (newName: string) => {
      this.name = newName;
    });

    client.on('lw-chat-message', this.handle, { object: this });
  }

  private handle(name: string, message: string): void {
    this.callbacks.forEach((callbackMap: CallbackMap) => {
      const callback = callbackMap.callback;
      const pattern = callbackMap.regex;
      if (message.match(pattern)) {
        callback(name, message); //TODO: There's no context handling for this
      }
    });
  };

  public send(message: string) {
    this.client.send('lw-chat-message', message);
  }

  public on(match: RegExp, callback: Callback): void {
    const map: CallbackMap = {
      regex: match,
      callback: callback
    };

    this.callbacks.push(map)
  }

  public onAll(callback: Callback) {
    const regex = /.*/; // Match all messages (hopefully)
    this.on(regex, callback);
  }
}
