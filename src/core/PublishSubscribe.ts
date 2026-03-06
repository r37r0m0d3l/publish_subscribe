import PROTOTYPE_ASYNC from "../const/PROTOTYPE_ASYNC.js";
import PROTOTYPE_SYNC from "../const/PROTOTYPE_SYNC.js";
import Subscription from "../core/Subscription.js";
import TOKEN_LENGTH from "../const/TOKEN_LENGTH.js";
import call from "../utils/call.js";
import clone from "../utils/clone.js";
import getPrototypeName from "../utils/getPrototypeName.js";
import isObjectEmpty from "../utils/isObjectEmpty.js";
import isSame from "../utils/isSame.js";
import newObject from "../utils/newObject.js";
import objectKeys from "../utils/objectKeys.js";

type Channel = number | string | symbol;
type Token = string;
type PublishResult = { channel: Channel; result: unknown; token: Token };
type AnyFunction = (...args: Array<unknown>) => unknown;
type SubscriberCallback = (data: unknown, channel: Channel, token: Token) => unknown | Promise<unknown>;
type AsyncSubscriberCallback = (data: unknown, channel: Channel, token: Token) => Promise<unknown>;
type PublishCallback = (channel: Channel, data: unknown) => unknown;
type PublishSyncCallback = (results: Array<PublishResult> | unknown[]) => void;
type OnSubscribeEntry = { cloneData: boolean; data: unknown };
type LogInfo = { method: string } & Record<string, unknown>;
type LogCallback = (info: LogInfo) => unknown;
type SubscriptionInstance = InstanceType<typeof Subscription>;
type SubscriptionMap = Record<Token, SubscriptionInstance>;

/**
 * @class PublishSubscribe
 */
class PublishSubscribe {
  protected __channels: Set<Channel>;
  protected __onSubscribe: Map<Channel, OnSubscribeEntry>;
  protected __onPublish: PublishCallback;
  protected __subscriptions: Map<Channel, SubscriptionMap>;
  protected __isValidCallback: (callback: unknown) => callback is AnyFunction;
  protected __isValidChannel: (channel: unknown) => channel is Channel;
  protected __isValidToken: (token: unknown) => token is Token;
  protected __createChannel: (channel: Channel) => void;
  protected __createSubscription: (channel: Channel, callback: SubscriberCallback, once: boolean) => Token;
  protected __logging: (method: string, info?: Record<string, unknown>) => void;
  protected __hasLogging: boolean;
  // __channels = new Set();
  // __createChannel;
  // __createSubscription;
  // __hasLogging;
  // __isValidCallback;
  // __isValidChannel;
  // __isValidToken;
  // __logging;
  // __onPublish;
  // __subscriptions = new Map();
  /**
   * @name constructor
   * @public
   * @constructor
   */
  public constructor() {
    this.__channels = new Set();
    this.__onSubscribe = new Map();
    this.__onPublish = () => {};
    this.__subscriptions = new Map();
    this.__isValidCallback = function isValidCallback(callback: unknown): callback is AnyFunction {
      if (!callback) {
        return false;
      }
      return [PROTOTYPE_ASYNC, PROTOTYPE_SYNC].includes(getPrototypeName(callback));
    }.bind(this);
    this.__isValidChannel = function isValidChannel(channel: unknown): channel is Channel {
      return (
        typeof channel === "string" ||
        typeof channel === "symbol" ||
        (typeof channel === "number" && Number.isFinite(channel))
      );
    }.bind(this);
    this.__isValidToken = function isValidToken(token: unknown): token is Token {
      return typeof token === "string" && token.length === TOKEN_LENGTH;
    }.bind(this);
    this.__createChannel = function createChannel(channel: Channel) {
      if (!this.hasChannel(channel)) {
        this.__channels.add(channel);
        this.__subscriptions.set(channel, newObject());
      }
    }.bind(this);
    this.__createSubscription = function createSubscription(
      channel: Channel,
      callback: SubscriberCallback,
      once: boolean,
    ) {
      const subscription = new Subscription(channel, callback, once);
      const subscriptionReference = this.__subscriptions.get(channel) as SubscriptionMap;
      subscriptionReference[subscription.token] = subscription as SubscriptionInstance;
      return subscription.token;
    }.bind(this);
    this.disableLogging();
    this.dropAll();
    this.onPublish();
  }
  /**
   * @name disableLogging
   * @public
   * @returns {void}
   */
  public disableLogging() {
    this.__logging = () => {};
    this.__hasLogging = false;
  }
  /**
   * @name dropAll
   * @public
   * @returns {void}
   */
  public dropAll() {
    this.__logging("dropAll");
    this.__channels.clear();
    this.__onSubscribe.clear();
    this.__subscriptions.clear();
  }
  /**
   * @name dropChannel
   * @public
   * @param {number|string|symbol} channel
   * @returns {void}
   */
  public dropChannel(channel: Channel) {
    this.__logging("dropChannel", { channel });
    if (!this.hasChannel(channel)) {
      return;
    }
    this.__channels.delete(channel);
    this.__subscriptions.set(channel, newObject());
  }
  /**
   * @name getCallback
   * @description Get subscription callback by token
   * @public
   * @param {string} token
   * @returns {void|Function}
   */
  public getCallback(token: Token): SubscriberCallback | undefined {
    if (!this.__isValidToken(token)) {
      return;
    }
    let callback: SubscriberCallback | undefined = undefined;
    Array.from(this.__subscriptions.values()).some((subscriptions: SubscriptionMap) => {
      if (!(token in subscriptions)) {
        return false;
      }
      callback = subscriptions[token].callback as SubscriberCallback;
      return true;
    });
    return callback;
  }
  /**
   * @name getChannels
   * @public
   * @returns {Array.<number|string>}
   */
  public getChannels(): Array<number | string> {
    return Array.from(this.__channels)
      .filter((channel) => typeof channel !== "symbol")
      .sort((alpha, beta) => String(alpha).localeCompare(String(beta)));
  }
  /**
   * @name hasChannel
   * @public
   * @param {number|string|symbol} channel
   * @returns {boolean}
   */
  public hasChannel(channel: Channel) {
    return this.__channels.has(channel);
  }
  /**
   * @name hasSubscription
   * @public
   * @param {number|string|symbol} channel
   * @returns {boolean}
   */
  public hasSubscription(channel: Channel) {
    if (!this.hasChannel(channel)) {
      return false;
    }
    if (!this.__subscriptions.has(channel)) {
      return false;
    }
    return !isObjectEmpty(this.__subscriptions.get(channel));
  }
  /**
   * @name onPublish
   * @public
   * @param {function=} callback
   * @returns {void}
   */
  public onPublish(callback: PublishCallback | undefined = undefined) {
    if (callback === undefined) {
      this.__onPublish = () => {};
      return;
    }
    if (!this.__isValidCallback(callback)) {
      return;
    }
    this.__onPublish = (channel: Channel, data: unknown) => {
      call(callback, [channel, data]);
    };
  }
  /**
   * @name onSubscribe
   * @public
   * @param {number|string|symbol} channel
   * @param {*=} data
   * @param {boolean=} cloneData
   * @returns {void}
   * @throws TypeError
   */
  public onSubscribe(channel: Channel, data?: unknown, cloneData = true) {
    this.__logging("onSubscribe", { channel, data });
    if (!this.__isValidChannel(channel)) {
      throw new TypeError("Channel name should be String, Symbol, Number.");
    }
    this.__onSubscribe.set(channel, { cloneData, data });
  }
  /**
   * @name onSubscribeClear
   * @public
   * @param {number|string|symbol} channel
   * @returns {void}
   * @throws TypeError
   */
  public onSubscribeClear(channel: Channel) {
    this.__logging("onSubscribeClear", { channel });
    if (!this.__isValidChannel(channel)) {
      throw new TypeError("Channel name should be String, Symbol, Number.");
    }
    this.__onSubscribe.delete(channel);
  }
  /**
   * @name publish
   * @public
   * @param {number|string|symbol} channel
   * @param {*=} data
   * @param {boolean=} cloneData
   * @param {boolean=} sticky
   * @returns {Promise<PublishResult[]>}
   */
  public publish(channel: Channel, data?: unknown, cloneData = true, sticky = false): Promise<PublishResult[]> {
    let getData: () => unknown;
    if (cloneData) {
      getData = () => clone(data);
    } else {
      getData = () => data;
    }
    this.__logging("publish", { channel, data: getData() });
    this.__onPublish(channel, getData());
    if (sticky) {
      this.onSubscribe(channel, data, cloneData);
    }
    if (!this.hasChannel(channel)) {
      return Promise.resolve([]);
    }
    const promises: Array<Promise<PublishResult>> = [];
    const subscriptionReference = this.__subscriptions.get(channel) as SubscriptionMap;
    objectKeys(subscriptionReference).forEach((token) => {
      const subscription = subscriptionReference[token];
      const callbackReference = subscription.callback as SubscriberCallback | AsyncSubscriberCallback;
      switch (getPrototypeName(callbackReference)) {
        case PROTOTYPE_ASYNC:
          promises.push(
            new Promise((resolve) => {
              if (this.__hasLogging) {
                this.__logging("publish -> send", {
                  channel,
                  data: getData(),
                  token,
                });
              }
              let resultForPromise: PublishResult;
              (callbackReference as AsyncSubscriberCallback)(getData(), channel, token)
                .then((promiseResult) => {
                  resultForPromise = { channel, result: promiseResult, token };
                  resolve(resultForPromise);
                  if (this.__hasLogging) {
                    this.__logging("publish -> receive", {
                      channel,
                      result: clone(promiseResult),
                      token,
                    });
                  }
                  if (subscription.once) {
                    delete subscriptionReference[token];
                  }
                })
                .catch((error: unknown) => {
                  resultForPromise = { channel, result: error, token };
                  resolve(resultForPromise);
                  if (this.__hasLogging) {
                    this.__logging("publish -> receive", {
                      channel,
                      result: error,
                      token,
                    });
                  }
                  if (subscription.once) {
                    delete subscriptionReference[token];
                  }
                });
            }),
          );
          break;
        case PROTOTYPE_SYNC:
          promises.push(
            new Promise((resolve) => {
              if (this.__hasLogging) {
                this.__logging("publish -> send", {
                  channel,
                  data: getData(),
                  token,
                });
              }
              let resultForPromise: unknown;
              try {
                resultForPromise = (callbackReference as SubscriberCallback)(getData(), channel, token);
              } catch (error: unknown) {
                resultForPromise = error;
              }
              resolve({ channel, result: resultForPromise, token });
              if (this.__hasLogging) {
                this.__logging("publish -> receive", {
                  channel,
                  result: clone(resultForPromise),
                  token,
                });
              }
              if (subscription.once) {
                delete subscriptionReference[token];
              }
            }),
          );
          break;
      }
    });
    return Promise.all(promises);
  }
  /**
   * @name publishAsync
   * @public
   * @param {number|string|symbol} channel
   * @param {*=} data
   * @param {boolean=} resultOnly
   * @param {boolean=} cloneData
   * @param {boolean=} sticky
   * @returns {Promise}
   */
  public publishAsync(
    channel: Channel,
    data?: unknown,
    resultOnly?: true,
    cloneData?: boolean,
    sticky?: boolean,
  ): Promise<Array<unknown>>;
  public publishAsync(
    channel: Channel,
    data: unknown,
    resultOnly: false,
    cloneData?: boolean,
    sticky?: boolean,
  ): Promise<Array<PublishResult>>;
  public publishAsync(channel: Channel, data?: unknown, resultOnly = true, cloneData = true, sticky = false) {
    let getData: () => unknown;
    if (cloneData) {
      getData = () => clone(data);
    } else {
      getData = () => data;
    }
    if (this.__hasLogging) {
      this.__logging("publishAsync", { channel, data: getData() });
    }
    this.__onPublish(channel, getData());
    if (sticky) {
      this.onSubscribe(channel, data, cloneData);
    }
    if (!this.hasChannel(channel)) {
      return Promise.all([]);
    }
    const promises: Array<Promise<PublishResult>> = [];
    const subscriptionReference = this.__subscriptions.get(channel) as SubscriptionMap;
    objectKeys(subscriptionReference).forEach((token) => {
      const subscription = subscriptionReference[token];
      const callbackReference = subscription.callback as SubscriberCallback | AsyncSubscriberCallback;
      switch (getPrototypeName(callbackReference)) {
        case PROTOTYPE_ASYNC:
          promises.push(
            new Promise((resolve) => {
              if (this.__hasLogging) {
                this.__logging("publishAsync -> send", {
                  channel,
                  data: getData(),
                  token,
                });
              }
              let resultForPromise: PublishResult;
              (callbackReference as AsyncSubscriberCallback)(getData(), channel, token)
                .then((promiseResult) => {
                  resultForPromise = { channel, result: promiseResult, token };
                  resolve(resultForPromise);
                  if (this.__hasLogging) {
                    this.__logging("publishAsync -> receive", {
                      channel,
                      result: clone(promiseResult),
                      token,
                    });
                  }
                  if (subscription.once) {
                    delete subscriptionReference[token];
                  }
                })
                .catch((error: unknown) => {
                  resultForPromise = { channel, result: error, token };
                  resolve(resultForPromise);
                  if (this.__hasLogging) {
                    this.__logging("publishAsync -> receive", {
                      channel,
                      result: error,
                      token,
                    });
                  }
                  if (subscription.once) {
                    delete subscriptionReference[token];
                  }
                });
            }),
          );
          break;
        case PROTOTYPE_SYNC:
          promises.push(
            new Promise((resolve) => {
              if (this.__hasLogging) {
                this.__logging("publishAsync -> send", {
                  channel,
                  data: getData(),
                  token,
                });
              }
              let resultForPromise: unknown;
              try {
                resultForPromise = (callbackReference as SubscriberCallback)(getData(), channel, token);
              } catch (error: unknown) {
                resultForPromise = error;
              }
              resolve({ channel, result: resultForPromise, token });
              if (this.__hasLogging) {
                this.__logging("publishAsync -> receive", {
                  channel,
                  result: clone(resultForPromise),
                  token,
                });
              }
              if (subscription.once) {
                delete subscriptionReference[token];
              }
            }),
          );
          break;
      }
    });
    if (resultOnly) {
      return Promise.all(promises).then((results) => results.map((subscription) => subscription.result));
    }
    return Promise.all(promises);
  }
  /**
   * @name publishSync
   * @public
   * @param {number|string|symbol} channel
   * @param {*=} data
   * @param {boolean=} resultOnly
   * @param {boolean=} cloneData
   * @param {function=} callback
   * @param {boolean=} sticky
   * @returns {array}
   */
  public publishSync(
    channel: Channel,
    data?: unknown,
    resultOnly?: true,
    cloneData?: boolean,
    callback?: PublishSyncCallback,
    sticky?: boolean,
  ): Array<unknown>;
  public publishSync(
    channel: Channel,
    data: unknown,
    resultOnly: false,
    cloneData?: boolean,
    callback?: PublishSyncCallback,
    sticky?: boolean,
  ): Array<PublishResult>;
  public publishSync(
    channel: Channel,
    data?: unknown,
    resultOnly = true,
    cloneData = true,
    callback: PublishSyncCallback | undefined = undefined,
    sticky = false,
  ) {
    let getData: () => unknown;
    if (cloneData) {
      getData = () => clone(data);
    } else {
      getData = () => data;
    }
    if (this.__hasLogging) {
      this.__logging("publishSync", { channel, data: getData() });
    }
    this.__onPublish(channel, getData());
    let curryCallback: PublishSyncCallback;
    if (callback && this.__isValidCallback(callback)) {
      curryCallback = (args) => call(callback, [args]);
    } else {
      curryCallback = () => {};
    }
    if (sticky) {
      this.onSubscribe(channel, data, cloneData);
    }
    if (!this.hasChannel(channel)) {
      curryCallback([]);
      return [];
    }
    const subscriptionReference = this.__subscriptions.get(channel) as SubscriptionMap;
    let results: Array<PublishResult> = [];
    objectKeys(subscriptionReference).forEach((token) => {
      const subscription = subscriptionReference[token];
      const callbackReference = subscription.callback as SubscriberCallback;
      if (getPrototypeName(callbackReference) !== PROTOTYPE_SYNC) {
        return;
      }
      if (this.__hasLogging) {
        this.__logging("publishSync -> send", {
          channel,
          data: getData(),
          token,
        });
      }
      let result: unknown;
      try {
        result = callbackReference(getData(), channel, token);
      } catch (error: unknown) {
        result = error;
      }
      results.push({ channel, result, token });
      if (this.__hasLogging) {
        this.__logging("publishSync -> receive", {
          channel,
          result: clone(result),
          token,
        });
      }
      if (subscription.once) {
        delete subscriptionReference[token];
      }
    });
    if (resultOnly) {
      const resultValues = results.map((subscription) => subscription.result) as Array<unknown>;
      curryCallback(resultValues);
      return resultValues;
    }
    curryCallback(results);
    return results;
  }
  /**
   * @name setLogging
   * @public
   * @param {function} callback
   * @returns {void}
   */
  public setLogging(callback: LogCallback) {
    if (!this.__isValidCallback(callback)) {
      return;
    }
    switch (getPrototypeName(callback)) {
      case PROTOTYPE_ASYNC:
        this.__logging = (method, info) => {
          const logInfo: LogInfo = { ...(info ?? {}), method };
          (callback as (info: LogInfo) => Promise<unknown>)(logInfo)
            .then(() => {})
            .catch(() => {});
        };
        this.__hasLogging = true;
        break;
      case PROTOTYPE_SYNC:
        this.__logging = (method, info) => {
          const logInfo: LogInfo = { ...(info ?? {}), method };
          try {
            (callback as LogCallback)(logInfo);
          } catch (_error: unknown) {
            //
          }
        };
        this.__hasLogging = true;
        break;
    }
  }
  /**
   * @name subscribe
   * @public
   * @param {number|string|symbol} channel
   * @param {function=} callback
   * @param {boolean=} once
   * @returns {TypeError|string}
   * @throws TypeError
   */
  public subscribe(channel: Channel, callback: SubscriberCallback, once = false) {
    this.__logging("subscribe", { channel, callback, once });
    if (!this.__isValidChannel(channel)) {
      return new TypeError("Channel name should be String, Symbol, Number.");
    }
    if (!this.__isValidCallback(callback)) {
      return new TypeError("Callback should be a function.");
    }
    this.__createChannel(channel);
    const token = this.__createSubscription(channel, callback, once);
    if (this.__onSubscribe.has(channel)) {
      const { cloneData, data } = this.__onSubscribe.get(channel) as OnSubscribeEntry;
      this.publish(channel, data, cloneData);
    }
    return token;
  }
  /**
   * @name subscribeOnce
   * @public
   * @param {number|string|symbol} channel
   * @param {function=} callback
   * @returns {TypeError|string}
   * @throws TypeError
   */
  public subscribeOnce(channel: Channel, callback: SubscriberCallback) {
    this.__logging("subscribeOnce", { channel, callback });
    if (!this.__isValidChannel(channel)) {
      return new TypeError("Channel name should be String, Symbol, Number.");
    }
    if (!this.__isValidCallback(callback)) {
      return new TypeError("Callback should be a function.");
    }
    this.__createChannel(channel);
    return this.__createSubscription(channel, callback, true);
  }
  /**
   * @name unsubscribe
   * @public
   * @param {function|number|string|symbol} channel
   * @param {function=} callback
   * @returns {number}
   */
  public unsubscribe(channel: Channel, callback: SubscriberCallback): number;
  public unsubscribe(callback: SubscriberCallback): number;
  public unsubscribe(token: Token): number;
  public unsubscribe(callbackChannelToken: Channel | SubscriberCallback | Token, callback?: SubscriberCallback) {
    if (callback !== undefined) {
      if (!this.__isValidChannel(callbackChannelToken)) {
        return 0;
      }
      return this.unsubscribeByChannelAndCallback(callbackChannelToken, callback);
    }
    if (this.__isValidCallback(callbackChannelToken)) {
      return this.unsubscribeByCallback(callbackChannelToken);
    }
    if (this.__isValidToken(callbackChannelToken)) {
      return this.unsubscribeByToken(callbackChannelToken);
    }
    return 0;
  }
  /**
   * @name unsubscribeByCallback
   * @public
   * @param {function} callback
   * @returns {number}
   */
  public unsubscribeByCallback(callback: SubscriberCallback) {
    this.__logging("unsubscribeByCallback", { callback });
    if (!this.__isValidCallback(callback)) {
      return 0;
    }
    let deleted = 0;
    this.__subscriptions.forEach((subscriptions: SubscriptionMap) => {
      objectKeys(subscriptions).forEach((key) => {
        if (isSame(subscriptions[key].callback, callback)) {
          delete subscriptions[key];
          deleted += 1;
        }
      });
    });
    return deleted;
  }
  /**
   * @name unsubscribeByChannelAndCallback
   * @public
   * @param {number|string|symbol} channel
   * @param {function} callback
   * @returns {number}
   */
  public unsubscribeByChannelAndCallback(channel: Channel, callback: SubscriberCallback) {
    this.__logging("unsubscribeByChannelAndCallback", { callback });
    if (!this.hasSubscription(channel)) {
      return 0;
    }
    const subscriptions = this.__subscriptions.get(channel) as SubscriptionMap;
    let deleted = 0;
    objectKeys(subscriptions).forEach((key) => {
      if (isSame(subscriptions[key].callback, callback)) {
        delete subscriptions[key];
        deleted += 1;
      }
    });
    return deleted;
  }
  /**
   * @name unsubscribeByToken
   * @public
   * @param {string} token
   * @returns {number}
   */
  public unsubscribeByToken(token: Token) {
    this.__logging("unsubscribeByToken", { token });
    if (!this.__isValidToken(token)) {
      return 0;
    }
    let deleted = 0;
    this.__subscriptions.forEach((subscriptions: SubscriptionMap) => {
      if (token in subscriptions) {
        delete subscriptions[token];
        deleted += 1;
      }
    });
    return deleted;
  }
}

export default PublishSubscribe;
