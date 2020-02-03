# Publish Subscribe

JavaScript implementation of the Publish-Subscribe pattern.

[🗎 Publish Subscribe Documentation 🗎](https://publish-subscribe.js.org)

[![NPM Version](https://img.shields.io/npm/v/@r37r0m0d3l/publish_subscribe.svg?style=flat)]()
[![NPM Downloads](https://img.shields.io/npm/dt/@r37r0m0d3l/publish_subscribe.svg?style=flat)]()
[![Build Status](https://travis-ci.org/r37r0m0d3l/publish_subscribe.svg?branch=master)](https://travis-ci.org/r37r0m0d3l/publish_subscribe)
[![Issues](https://img.shields.io/github/issues-raw/r37r0m0d3l/publish_subscribe.svg?maxAge=25000)](https://github.com/r37r0m0d3l/publish_subscribe/issues)

[![Known Vulnerabilities](https://snyk.io/test/github/r37r0m0d3l/publish_subscribe/badge.svg?targetFile=package.json)](https://snyk.io/test/github/r37r0m0d3l/publish_subscribe?targetFile=package.json)
[![Dependency Status](https://david-dm.org/r37r0m0d3l/publish_subscribe.svg)](https://david-dm.org/r37r0m0d3l/publish_subscribe)
[![devDependencies Status](https://david-dm.org/r37r0m0d3l/publish_subscribe/dev-status.svg)](https://david-dm.org/r37r0m0d3l/publish_subscribe?type=dev)

[![Maintainability](https://api.codeclimate.com/v1/badges/6b1544ba3a56a4df3e43/maintainability)](https://codeclimate.com/github/r37r0m0d3l/publish_subscribe/maintainability)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d56de445cce64ea399f7234f24b1d870)](https://www.codacy.com/manual/r37r0m0d3l/publish_subscribe?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=r37r0m0d3l/publish_subscribe&amp;utm_campaign=Badge_Grade)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=r37r0m0d3l_publish_subscribe&metric=alert_status)](https://sonarcloud.io/dashboard?id=r37r0m0d3l_publish_subscribe)

[![GitHub stars](https://img.shields.io/github/stars/r37r0m0d3l/publish_subscribe.svg?style=social&label=Star)](https://github.com/r37r0m0d3l/publish_subscribe)
[![GitHub watchers](https://img.shields.io/github/watchers/r37r0m0d3l/publish_subscribe.svg?style=social&label=Watch)](https://github.com/r37r0m0d3l/publish_subscribe)
[![GitHub followers](https://img.shields.io/github/followers/r37r0m0d3l.svg?style=social&label=Follow)](https://github.com/r37r0m0d3l/publish_subscribe)
[![GitHub forks](https://img.shields.io/github/forks/r37r0m0d3l/publish_subscribe.svg?style=social&label=Fork)]()

---

_If you use this project don't forget to give a ⭐ [star](https://github.com/r37r0m0d3l/publish_subscribe) ⭐ to it on GitHub!_

---

## 🏃💨 Tl;dr

```typescript
import { PublishSubscribe } from "@r37r0m0d3l/publish_subscribe/es";
//
const pubsub: PublishSubscribe = new PublishSubscribe();
type IChannel = number|string|symbol;
const CHANNEL: IChannel = "app";
//
const isCalledOnce: boolean = false;
function syncCallback(data: any, channel: IChannel, token: string): any {
  return true;
}
async function asyncCallback(
  data: any,
  channel: IChannel,
  token: string
): any {
  return true;
}
const tokenSync: string = pubsub
  .subscribe(CHANNEL, syncCallback, isCalledOnce);
const tokenAsync: string = pubsub
  .subscribe(CHANNEL, syncCallback, isCalledOnce);
//
const data: any = { someData: "to publish" };
const resultOnly: boolean = true;
const cloneData: boolean = true;
function callback(
  results: Array<any | { channel: IChannel; data: any; token?: string }>
): any {}
const resultsSync = pubsub
  .publishSync(CHANNEL, data, resultOnly, cloneData, callback);
(async () => {
  const resultsAsync = await pubsub
    .publishAsync(CHANNEL, data, resultOnly, cloneData);
})();
```

## 📦 Usage

Installation.

```bash
npm install @r37r0m0d3l/publish_subscribe
```

CommonJS.

```js
const PublishSubscribe = require("@r37r0m0d3l/publish_subscribe").default;
```

```js
const { PublishSubscribe } = require("@r37r0m0d3l/publish_subscribe");
```

ECMAScript Modules.

```typescript
import { PublishSubscribe } from "@r37r0m0d3l/publish_subscribe/es";
```

UNPKG CDN.

```html
<script
  src="https://unpkg.com/@r37r0m0d3l/publish_subscribe/dist/publish_subscribe.js"
></script>
```

## ⌨ Creating Instance

```js
const pubsub = new PublishSubscribe();
```

## ℹ Logging

Set log function.

```js
pubsub.setLogging((info) => {
  console.group("LOGGING!!!");
  console.log(info);
  /*
  Example when subscribing:
  {
    channel: "app",
    callback: [Function: sync],
    once: false,
    method: "subscribe"
  }
  Example when publishing:
  {
    channel: "app",
    data: { data: "the data" },
    token: "CETl6gZXkTMhm7JY",
    method: "publishSync -> send"
  }
  */
  console.groupEnd();
});

pubsub.disableLogging();
```

## 📛 Naming Channels

Channels can be finite numbers, strings or symbols.

```js
const CHANNEL_NAME_AS_STRING = "TheChannelName";
const CHANNEL_NAME_AS_NUMBER = 123;
const CHANNEL_NAME_AS_SYMBOL = Symbol("ThisChannelLookVeryPrivate");
const CHANNEL = "channel_name";
```

## 📩 Subscription

Synchronous subscription.

```js
const tokenOfSynchronous = pubsub
  .subscribe("channel_name", function sync(data, channel, token) {
    return {
      message: "Here can by any kind data for synchronous functions"
    };
  });
```

Asynchronous subscription.

```js
const tokenOfAsynchronous = pubsub
  .subscribe("channel_name", async (data, channel, token) => {
    // Other async call here
    return "Here can by any kind data for asynchronous functions";
  });
```

Reusable subscription.

```js
/**
 * @param {*} data
 * @param {number|string|Symbol} channel
 * @param {string} token
 */
function synchronousCallback(data, channel, token) {
  // And here is no any data returned if you wish
}
const tokenOne = pubsub.subscribe("channel_name_1", synchronousCallback);
const tokenTwo = pubsub.subscribe("channel_name_2", synchronousCallback);
```

No need for token as subscription will expire after first successful call.

```js
pubsub.subscribeOnce("channel_exit", (data, channel, _token) => {});
```

## 📨 Publishing Events

Intercept all publishing.

```js
pubsub.onPublish((channel, data) => {
  // All publishing will be intercepted here
  // and you can do your "message matching" here
  switch(channel) {
    case "app:logout":
      pubsub.dropAll();
    break;
  }
});

pubsub.onPublish(); // now its disabled
```

Get synchronous results from subscribers.

```js
// Channel name
const channel = "app:start";
// Any kind of data - primitive or object
const data = { data: "the data" };
// Default behavior
const resultOnly = true;
// Prevent published data changes between subscriptions
const cloneData = true;
// Array with results
const results = pubsub
  .publishSync(channel, data, resultOnly, cloneData, (results) => {
    // Only synchronous functions will be called!
    // Array of results can be intercepted in callback
    console.log(results);
  });
console.log(results); // or can be accessed as function call
```

Get synchronous and asynchronous results from subscribers.

```js
pubsub
  .publishAsync("channel_name", { data: "the data" }, false)
    .then((results) => {
      // results here also contains
      // additional array of data from subscribers
      // [ { channel: "app", result: "data", token: "zzroUP97lnxL0VUa" } ]
    });
```

Do not wait anything from subscribers - use `publish`.

```js
pubsub.publish("channel_name", { data: "the data" });
```

## 📪 Unsubscribe

Unsubscribe via token previously retrieved from `subscribe` method.

```js
const token = pubsub.subscribe("channel_name", () => {});
pubsub.unsubscribeByToken(token);
```

Unsubscribe by channel and callback.

All subscriptions in `channel` based on `callback` will be removed.

```js
// callback == function someFunction(data, channel, token) {}
pubsub.unsubscribeByChannelAndCallback("channel_name", callback);
```

This `callback` function will be removed from **all** subscriptions.

```js
pubsub.unsubscribeByCallback(callback);
```

Unsubscribe based on parameters provided.

```js
pubsub.unsubscribe(callbackOrChannelOrToken);
pubsub.unsubscribe(channel, callback);
```

## 🛠️ Utilities

Retrieve callback function via token.

```js
// token == "zzroUP97lnxL0VUa"
const callback = pubsub.getCallback(token);
```

Has any subscriptions.

```js
pubsub.hasSubscription("channel_name");
```

Has channel.

```js
pubsub.hasChannel("channel_name");
```

Get list of channels. Array of numbers, strings, symbols.

```js
pubsub.getChannels();
```

Drop channel.

```js
pubsub.dropChannel("channel_name");
```

Clear instance.

```js
pubsub.dropAll();
```

## 🤷 About

Yet another publish-subscribe library? Why this library exists:

-   ⭐⭐⭐

    -   Preventing published data changes between subscriptions.

    -   Possibility to publish events asynchronously.

    -   Possibility to do synchronous publishing and receive data from subscriptions.

    -   Possibility to use async callbacks in subscriptions.

    -   Get subscription callback function by token and use it somewhere else.

    -   Error swallowing. Publish-subscribe pattern should not broke on some function somewhere deep in code.

-   ⭐⭐

    -   Possibility to use finite numbers, strings or symbols as channel names.

    -   Subscription functions receive callback token among channel name and published data.

    -   Has _subscribeOnce_ method.

    -   Has _onPublish_ method for _global message matching_.

-   ⭐

    -   Custom logging into console for most actions.

    -   TypeScript definitions.

    -   Almost dependency free. This library will work even if the last commit was ten years ago.

The **worst** things that can happen to publish-subscribe library that is **not** here:

-   ☠️☠️☠️

    -   You should have **multiple subscriptions** for one channel. Somehow it does not exists in other libraries.

    -   Event inheritance. This should be handled by subscription callbacks **not by** the publish-subscribe system.

    -   Hellish **wildcards-hierarchical addressing-messages matching** for each event. First of all this is impossible with numbers or symbols. And this makes no sense as you can create root channel name anyway. In example when you publish `"app:user:registered"` and `"app:user:login"`, just publish `"app:user"` among others. While when you publish `"app:user:re-login"`, do not publish `"app:user"` and `"re-login"` event will be kept _private_ or _unimportant_ to others.

-   ☠️☠️

    -   Possibility to define **context for each callback**. You have arrow functions for that. You should not save context in one place and take it hostage. Probably you should use global variables instead etc.

    -   **Cancel publish** event distribution for subscribers. This behavior reserved for Observer pattern.

-   ☠️

    -   No **order priority** for subscriptions. Somehow pattern should be about decoupling, but sometimes it has it in.

The things you may not like:

-   🔌🔌🔌

    -   No ECMAScript 3 / ECMAScript 5 / Internet Explorer 6 compatibility. You can transpile library to CommonJS module via Babel with configuration you need.

## 👀 Discover more

-   🔎[Consono](https://consono.js.org)🔎 - The most informative and correct variable inspector for JavaScript on the web.

-   🌠[OF](https://of.js.org)🌠 - Promise wrapper with some sugar.

-   🔩[Local Storage Fallback](https://github.com/r37r0m0d3l/fallback-local-storage)🔩 - Universal localStorage fallback.

-   🧰[Vicis](https://vicis.js.org)🧰 - Presentation and transformation layer for data output in RESTful APIs.

Or find useful these tools:

-   🧾[JSON Sorter](https://r37r0m0d3l.github.io/json_sort)🧾 - Neat online JSON sorter.
