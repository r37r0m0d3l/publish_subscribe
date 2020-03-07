(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.PublishSubscribe = {}));
}(this, (function (exports) { 'use strict';

  var PROTOTYPE_ASYNC = "[object AsyncFunction]";

  var PROTOTYPE_SYNC = "[object Function]";

  var TOKEN_LENGTH = 16;

  function generateToken() {
    const random = new Array(TOKEN_LENGTH);
    for (let index = 0; index < TOKEN_LENGTH; index += 1) {
      random[index] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 62)];
    }
    return random.join("");
  }

  class Subscription {
    // callback;
    // channel;
    // once;
    // token;
    constructor(channel, callback, once = false) {
      this.callback = callback;
      this.channel = channel;
      this.once = once;
      this.token = generateToken();
    }
  }

  function getPrototypeName(value) {
    return Object.prototype.toString.call(value);
  }

  function call(callback, args) {
    if (!callback) {
      return;
    }
    switch (getPrototypeName(callback)) {
      case PROTOTYPE_ASYNC:
        callback(...args)
          .then(() => {})
          .catch(() => {});
        break;
      case PROTOTYPE_SYNC:
        try {
          callback(...args);
        } catch (_error) {
          //
        }
        break;
    }
  }

  function clone(val) {
    switch (typeOf(val)) {
      case "array":
        return val.slice();
      case "object":
        return Object.assign({}, val);
      case "date":
        return new val.constructor(Number(val));
      case "map":
        return new Map(val);
      case "set":
        return new Set(val);
      case "buffer":
        return cloneBuffer(val);
      case "symbol":
        return cloneSymbol(val);
      case "arraybuffer":
        return cloneArrayBuffer(val);
      case "float32array":
      case "float64array":
      case "int16array":
      case "int32array":
      case "int8array":
      case "uint16array":
      case "uint32array":
      case "uint8clampedarray":
      case "uint8array":
        return cloneTypedArray(val);
      case "regexp":
        return cloneRegExp(val);
      case "error":
        return Object.create(val);
      default: {
        return val;
      }
    }
  }
  function cloneRegExp(val) {
    const flags = val.flags !== void 0 ? val.flags : /\w+$/.exec(val) || void 0;
    const re = new val.constructor(val.source, flags);
    re.lastIndex = val.lastIndex;
    return re;
  }
  function cloneArrayBuffer(val) {
    const res = new val.constructor(val.byteLength);
    new Uint8Array(res).set(new Uint8Array(val));
    return res;
  }
  function cloneTypedArray(val) {
    return new val.constructor(val.buffer, val.byteOffset, val.length);
  }
  function cloneBuffer(val) {
    const len = val.length;
    const buf = Buffer.allocUnsafe ? Buffer.allocUnsafe(len) : Buffer.from(len);
    val.copy(buf);
    return buf;
  }
  function cloneSymbol(val) {
    return Symbol.prototype.valueOf ? Object(Symbol.prototype.valueOf.call(val)) : {};
  }
  function isBuffer(obj) {
    return (
      obj !== null &&
      Boolean(obj.constructor) &&
      typeof obj.constructor.isBuffer === "function" &&
      obj.constructor.isBuffer(obj)
    );
  }
  function typeOf(val) {
    if (typeof val === "undefined") {
      return "undefined";
    }
    if (val === null) {
      return "null";
    }
    if (val === true || val === false || val instanceof Boolean) {
      return "boolean";
    }
    if (typeof val === "string" || val instanceof String) {
      return "string";
    }
    if (typeof val === "number" || val instanceof Number) {
      return "number";
    }
    if (typeof val === "function" || val instanceof Function) {
      return "function";
    }
    if (typeof Array.isArray !== "undefined" && Array.isArray(val)) {
      return "array";
    }
    if (val instanceof RegExp) {
      return "regexp";
    }
    if (val instanceof Date) {
      return "date";
    }
    var type = toString.call(val);
    if (type === "[object RegExp]") {
      return "regexp";
    }
    if (type === "[object Date]") {
      return "date";
    }
    if (type === "[object Arguments]") {
      return "arguments";
    }
    if (type === "[object Error]") {
      return "error";
    }
    if (isBuffer(val)) {
      return "buffer";
    }
    if (type === "[object Set]") {
      return "set";
    }
    if (type === "[object WeakSet]") {
      return "weakset";
    }
    if (type === "[object Map]") {
      return "map";
    }
    if (type === "[object WeakMap]") {
      return "weakmap";
    }
    if (type === "[object Symbol]") {
      return "symbol";
    }
    if (type === "[object Int8Array]") {
      return "int8array";
    }
    if (type === "[object Uint8Array]") {
      return "uint8array";
    }
    if (type === "[object Uint8ClampedArray]") {
      return "uint8clampedarray";
    }
    if (type === "[object Int16Array]") {
      return "int16array";
    }
    if (type === "[object Uint16Array]") {
      return "uint16array";
    }
    if (type === "[object Int32Array]") {
      return "int32array";
    }
    if (type === "[object Uint32Array]") {
      return "uint32array";
    }
    if (type === "[object Float32Array]") {
      return "float32array";
    }
    if (type === "[object Float64Array]") {
      return "float64array";
    }
    return "object";
  }
  function isObject(obj) {
    return typeof obj === "object" && obj !== null;
  }
  function isObjectObject(obj) {
    return isObject(obj) === true && Object.prototype.toString.call(obj) === "[object Object]";
  }
  function isPlainObject(obj) {
    let ctor;
    let prototype;
    if (isObjectObject(obj) === false) {
      return false;
    }
    ctor = obj.constructor;
    if (typeof ctor !== "function") {
      return false;
    }
    prototype = ctor.prototype;
    if (isObjectObject(prototype) === false) {
      return false;
    }
    return prototype.hasOwnProperty("isPrototypeOf") !== false;
  }
  function cloneDeep(val, instanceClone) {
    switch (typeOf(val)) {
      case "object":
        return cloneObjectDeep(val, instanceClone);
      case "array":
        return cloneArrayDeep(val, instanceClone);
      default: {
        return clone(val);
      }
    }
  }
  function cloneObjectDeep(val, instanceClone) {
    if (typeof instanceClone === "function") {
      return instanceClone(val);
    }
    if (instanceClone || isPlainObject(val)) {
      const res = new val.constructor();
      for (let key in val) {
        res[key] = cloneDeep(val[key], instanceClone);
      }
      return res;
    }
    return val;
  }
  function cloneArrayDeep(val, instanceClone) {
    const res = new val.constructor(val.length);
    for (let index = 0; index < val.length; index++) {
      res[index] = cloneDeep(val[index], instanceClone);
    }
    return res;
  }

  /**
   * @name isPrimitive
   * @description Return true on boolean, string, number, BigInt, null, Symbol and undefined
   * @param {*} value
   * @return {boolean}
   */
  function isPrimitive(value) {
    return Object(value) !== value;
  }

  function clone$1(value) {
    if (isPrimitive(value)) {
      return value;
    }
    return cloneDeep(value);
  }

  function objectKeys(object) {
    return Object.keys(object);
  }

  function objectSize(object) {
    return objectKeys(object).length;
  }

  function isObjectEmpty(object) {
    return objectSize(object) === 0;
  }

  function isSame(variable1, variable2) {
    return Object.is(variable1, variable2);
  }

  function newObject() {
    return Object.create(null);
  }

  /**
   * @class PublishSubscribe
   */
  class PublishSubscribe {
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
    constructor() {
      this.__channels = new Set();
      this.__onSubscribe = new Map();
      this.__onPublish = () => {};
      this.__subscriptions = new Map();
      this.__isValidCallback = function isValidCallback(callback) {
        if (!callback) {
          return false;
        }
        return [PROTOTYPE_ASYNC, PROTOTYPE_SYNC].includes(getPrototypeName(callback));
      }.bind(this);
      this.__isValidChannel = function isValidChannel(channel) {
        return (
          typeof channel === "string" ||
          typeof channel === "symbol" ||
          (typeof channel === "number" && Number.isFinite(channel))
        );
      }.bind(this);
      this.__isValidToken = function isValidToken(token) {
        return typeof token === "string" && token.length === TOKEN_LENGTH;
      }.bind(this);
      this.__createChannel = function createChannel(channel) {
        if (!this.hasChannel(channel)) {
          this.__channels.add(channel);
          this.__subscriptions.set(channel, newObject());
        }
      }.bind(this);
      this.__createSubscription = function createSubscription(channel, callback, once) {
        const subscription = new Subscription(channel, callback, once);
        const subscriptionReference = this.__subscriptions.get(channel);
        subscriptionReference[subscription.token] = subscription;
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
    disableLogging() {
      this.__logging = () => {};
      this.__hasLogging = false;
    }
    /**
     * @name dropAll
     * @public
     * @returns {void}
     */
    dropAll() {
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
    dropChannel(channel) {
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
    getCallback(token) {
      if (!this.__isValidToken(token)) {
        return;
      }
      let callback = undefined;
      Array.from(this.__subscriptions.values()).some((subscriptions) => {
        if (!(token in subscriptions)) {
          return false;
        }
        callback = subscriptions[token].callback;
        return true;
      });
      return callback;
    }
    /**
     * @name getChannels
     * @public
     * @returns {Array.<number|string>}
     */
    getChannels() {
      return Array.from(this.__channels)
        .filter((channel) => typeof channel !== "symbol")
        .sort((alpha, beta) => alpha.localeCompare(beta));
    }
    /**
     * @name hasChannel
     * @public
     * @param {number|string|symbol} channel
     * @returns {boolean}
     */
    hasChannel(channel) {
      return this.__channels.has(channel);
    }
    /**
     * @name hasSubscription
     * @public
     * @param {number|string|symbol} channel
     * @returns {boolean}
     */
    hasSubscription(channel) {
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
    onPublish(callback = undefined) {
      if (callback === undefined) {
        this.__onPublish = () => {};
        return;
      }
      if (!this.__isValidCallback(callback)) {
        return;
      }
      this.__onPublish = (channel, data) => {
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
    onSubscribe(channel, data, cloneData = true) {
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
    onSubscribeClear(channel) {
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
     * @returns {void}
     */
    publish(channel, data, cloneData = true, sticky = false) {
      let getData;
      if (cloneData) {
        getData = () => clone$1(data);
      } else {
        getData = () => data;
      }
      this.__logging("publish", { channel, data: getData() });
      this.__onPublish(channel, getData());
      if (sticky) {
        this.onSubscribe(channel, data, cloneData);
      }
      if (!this.hasChannel(channel)) {
        return;
      }
      const promises = [];
      const subscriptionReference = this.__subscriptions.get(channel);
      objectKeys(subscriptionReference).forEach((token) => {
        const subscription = subscriptionReference[token];
        const callbackReference = subscription.callback;
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
                let resultForPromise;
                callbackReference(getData(), channel, token)
                  .then((promiseResult) => {
                    resultForPromise = { channel, result: promiseResult, token };
                    resolve(resultForPromise);
                    if (this.__hasLogging) {
                      this.__logging("publish -> receive", {
                        channel,
                        result: clone$1(promiseResult),
                        token,
                      });
                    }
                    if (subscription.once) {
                      delete subscriptionReference[token];
                    }
                  })
                  .catch((error) => {
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
                let resultForPromise;
                try {
                  resultForPromise = callbackReference(getData(), channel, token);
                } catch (error) {
                  resultForPromise = error;
                }
                resolve({ channel, result: resultForPromise, token });
                if (this.__hasLogging) {
                  this.__logging("publish -> receive", {
                    channel,
                    result: clone$1(resultForPromise),
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
      Promise.all(promises).then(() => {});
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
    publishAsync(channel, data, resultOnly = true, cloneData = true, sticky = false) {
      let getData;
      if (cloneData) {
        getData = () => clone$1(data);
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
      const promises = [];
      const subscriptionReference = this.__subscriptions.get(channel);
      objectKeys(subscriptionReference).forEach((token) => {
        const subscription = subscriptionReference[token];
        const callbackReference = subscription.callback;
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
                let resultForPromise;
                callbackReference(getData(), channel, token)
                  .then((promiseResult) => {
                    resultForPromise = { channel, result: promiseResult, token };
                    resolve(resultForPromise);
                    if (this.__hasLogging) {
                      this.__logging("publishAsync -> receive", {
                        channel,
                        result: clone$1(promiseResult),
                        token,
                      });
                    }
                    if (subscription.once) {
                      delete subscriptionReference[token];
                    }
                  })
                  .catch((error) => {
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
                let resultForPromise;
                try {
                  resultForPromise = callbackReference(getData(), channel, token);
                } catch (error) {
                  resultForPromise = error;
                }
                resolve({ channel, result: resultForPromise, token });
                if (this.__hasLogging) {
                  this.__logging("publishAsync -> receive", {
                    channel,
                    result: clone$1(resultForPromise),
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
    publishSync(channel, data, resultOnly = true, cloneData = true, callback = undefined, sticky = false) {
      let getData;
      if (cloneData) {
        getData = () => clone$1(data);
      } else {
        getData = () => data;
      }
      if (this.__hasLogging) {
        this.__logging("publishSync", { channel, data: getData() });
      }
      this.__onPublish(channel, getData());
      let curryCallback;
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
      const subscriptionReference = this.__subscriptions.get(channel);
      let results = [];
      objectKeys(subscriptionReference).forEach((token) => {
        const subscription = subscriptionReference[token];
        const callbackReference = subscription.callback;
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
        let result;
        try {
          result = callbackReference(getData(), channel, token);
        } catch (error) {
          result = error;
        }
        results.push({ channel, result, token });
        if (this.__hasLogging) {
          this.__logging("publishSync -> receive", {
            channel,
            result: clone$1(result),
            token,
          });
        }
        if (subscription.once) {
          delete subscriptionReference[token];
        }
      });
      if (resultOnly) {
        results = results.map((subscription) => subscription.result);
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
    setLogging(callback) {
      if (!this.__isValidCallback(callback)) {
        return;
      }
      switch (getPrototypeName(callback)) {
        case PROTOTYPE_ASYNC:
          this.__logging = (method, info) => {
            callback({ ...info, method })
              .then(() => {})
              .catch(() => {});
          };
          this.__hasLogging = true;
          break;
        case PROTOTYPE_SYNC:
          this.__logging = (method, info) => {
            try {
              callback({ ...info, method });
            } catch (_error) {
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
    subscribe(channel, callback, once = false) {
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
        let { cloneData, data } = this.__onSubscribe.get(channel);
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
    subscribeOnce(channel, callback) {
      this.__logging("subscribeOnce", { channel, callback });
      if (!this.__isValidChannel(channel)) {
        return new TypeError("Channel name should be String, Symbol, Number.");
      }
      if (!this.__isValidCallback(callback)) {
        return new TypeError("Callback should be a function.");
      }
      this.__createChannel(channel);
      return this.__createSubscription(channel, callback);
    }
    /**
     * @name unsubscribe
     * @public
     * @param {function|number|string|symbol} callbackChannelToken
     * @param {function=} callback
     * @returns {number}
     */
    unsubscribe(callbackChannelToken, callback) {
      if (callback !== undefined) {
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
    unsubscribeByCallback(callback) {
      this.__logging("unsubscribeByCallback", { callback });
      if (!this.__isValidCallback(callback)) {
        return 0;
      }
      let deleted = 0;
      this.__subscriptions.forEach((subscriptions) => {
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
    unsubscribeByChannelAndCallback(channel, callback) {
      this.__logging("unsubscribeByChannelAndCallback", { callback });
      if (!this.hasSubscription(channel)) {
        return 0;
      }
      const subscriptions = this.__subscriptions.get(channel);
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
    unsubscribeByToken(token) {
      this.__logging("unsubscribeByToken", { token });
      if (!this.__isValidToken(token)) {
        return 0;
      }
      let deleted = 0;
      this.__subscriptions.forEach((subscriptions) => {
        if (token in subscriptions) {
          delete subscriptions[token];
          deleted += 1;
        }
      });
      return deleted;
    }
  }

  exports.PublishSubscribe = PublishSubscribe;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
