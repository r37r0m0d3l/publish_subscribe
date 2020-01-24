/**
 * @class PublishSubscribe
 */
declare class PublishSubscribe {
  /**
   * @name constructor
   * @public
   * @constructor
   */
  public constructor();
  /**
   * @name disableLogging
   * @public
   * @returns {void}
   */
  public disableLogging(): void;
  /**
   * @name dropAll
   * @public
   * @returns {void}
   */
  public dropAll(): void;
  /**
   * @name dropChannel
   * @public
   * @param {number|string|symbol} channel
   * @returns {void}
   */
  public dropChannel(channel: number | string | symbol): void;
  /**
   * @name getCallback
   * @description Get subscription callback by token
   * @public
   * @param {string} token
   * @returns {void|Function}
   */
  public getCallback(token: string): void | Function;
  /**
   * @name getChannels
   * @public
   * @returns {Array.<number|string>}
   */
  public getChannels(): Array<number | string>;
  /**
   * @name hasChannel
   * @public
   * @param {number|string|symbol} channel
   * @returns {boolean}
   */
  public hasChannel(channel: number | string | symbol): boolean;
  /**
   * @name hasSubscription
   * @public
   * @param {number|string|symbol} channel
   * @returns {boolean}
   */
  public hasSubscription(channel: number | string | symbol): boolean;
  /**
   * @name hasSubscription
   * @public
   * @param {function=} callback
   * @returns {void}
   */
  onPublish(callback?: Function): void;
  /**
   * @name publish
   * @public
   * @param {number|string|symbol} channel
   * @param {*=} data
   * @param {boolean=} cloneData
   * @returns {void}
   */
  public publish(channel: number | string | symbol, data?: any, cloneData?: boolean): void;
  /**
   * @name publishAsync
   * @public
   * @param {number|string|symbol} channel
   * @param {*=} data
   * @param {boolean=} resultOnly
   * @param {boolean=} cloneData
   * @returns {Promise}
   */
  public publishAsync(
    channel: number | string | symbol,
    data?: any,
    resultOnly?: boolean,
    cloneData?: boolean,
  ): Promise<Array<any | { channel: number | string | symbol; data: any; token?: string }>>;
  /**
   * @name publishSync
   * @public
   * @param {number|string|symbol} channel
   * @param {*=} data
   * @param {boolean=} resultOnly
   * @param {boolean=} cloneData
   * @param {function=} callback
   * @returns {array}
   */
  public publishSync(
    channel: number | string | symbol,
    data?: any,
    resultOnly?: boolean,
    cloneData?: boolean,
    callback?: (results: Array<any | { channel: number | string | symbol; data: any; token?: string }>) => any,
  ): Array<any | { channel: number | string | symbol; data: any; token?: string }>;
  /**
   * @name setLogging
   * @public
   * @param {function} callback
   * @returns {void}
   */
  public setLogging(
    callback?: (information: { channel: number | string | symbol; method: string; result: any; token: string }) => void,
  ): void;
  /**
   * @name subscribe
   * @public
   * @param {number|string|symbol} channel
   * @param {function=} callback
   * @param {boolean=} once
   * @returns {TypeError|string}
   * @throws TypeError
   */
  public subscribe(
    channel: number | string | symbol,
    callback: (data: any, channel: number | string | symbol, token: string) => any,
    once?: boolean,
  ): string;
  /**
   * @name subscribeOnce
   * @public
   * @param {number|string|symbol} channel
   * @param {function=} callback
   * @returns {string}
   */
  public subscribeOnce(
    channel: number | string | symbol,
    callback: (data: any, channel: number | string | symbol, token: string) => any,
  ): string;
  /**
   * @name unsubscribe
   * @public
   * @param {function|number|string|symbol} callbackChannelToken
   * @param {function=} callback
   * @returns {number}
   */
  public unsubscribe(callbackChannelToken: number | string | symbol | Function, callback?: Function): number;
  /**
   * @name unsubscribeByCallback
   * @public
   * @param {function} callback
   * @returns {number}
   */
  public unsubscribeByCallback(callback: Function): number;
  /**
   * @name unsubscribeByChannelAndCallback
   * @public
   * @param {number|string|symbol} channel
   * @param {function} callback
   * @returns {number}
   */
  public unsubscribeByChannelAndCallback(channel: number | string | symbol, callback: Function): number;
  /**
   * @name unsubscribeByToken
   * @public
   * @param {string} token
   * @returns {number}
   */
  public unsubscribeByToken(token: string): number;
}
export default PublishSubscribe;
export { PublishSubscribe };
