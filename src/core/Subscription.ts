import generateToken from "../utils/generateToken.js";

type Channel = number | string | symbol;
type Token = string;
type SubscriberCallback = (data: unknown, channel: Channel, token: Token) => unknown | Promise<unknown>;

class Subscription {
  public callback: SubscriberCallback;
  protected channel: Channel;
  public once: boolean;
  public token: Token;
  // callback;
  // channel;
  // once;
  // token;
  public constructor(channel: Channel, callback: SubscriberCallback, once = false) {
    this.callback = callback;
    this.channel = channel;
    this.once = once;
    this.token = generateToken();
  }
}

export default Subscription;
