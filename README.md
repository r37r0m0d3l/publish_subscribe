# Publish / Subscribe

JavaScript implementation of the Publish/Subscribe pattern.

[![NPM Version](https://img.shields.io/npm/v/publish_subscribe.svg?style=flat)]()
[![NPM Downloads](https://img.shields.io/npm/dt/publish_subscribe.svg?style=flat)]()
[![Build Status](https://travis-ci.org/r37r0m0d3l/publish_subscribe.svg?branch=master)](https://travis-ci.org/r37r0m0d3l/publish_subscribe)
[![Issues](https://img.shields.io/github/issues-raw/r37r0m0d3l/publish_subscribe.svg?maxAge=25000)](https://github.com/r37r0m0d3l/publish_subscribe/issues)
[![Known Vulnerabilities](https://snyk.io/test/github/r37r0m0d3l/publish_subscribe/badge.svg?targetFile=package.json)](https://snyk.io/test/github/r37r0m0d3l/publish_subscribe?targetFile=package.json)

[![Maintainability](https://api.codeclimate.com/v1/badges/272b5247f8b777c75360/maintainability)](https://codeclimate.com/github/r37r0m0d3l/publish_subscribe/maintainability)
[![Dependency Status](https://david-dm.org/r37r0m0d3l/publish_subscribe.svg)](https://david-dm.org/r37r0m0d3l/publish_subscribe)
[![devDependencies Status](https://david-dm.org/r37r0m0d3l/publish_subscribe/dev-status.svg)](https://david-dm.org/r37r0m0d3l/publish_subscribe?type=dev)

[![GitHub stars](https://img.shields.io/github/stars/r37r0m0d3l/publish_subscribe.svg?style=social&label=Star)](https://github.com/r37r0m0d3l/publish_subscribe)
[![GitHub watchers](https://img.shields.io/github/watchers/r37r0m0d3l/publish_subscribe.svg?style=social&label=Watch)](https://github.com/r37r0m0d3l/publish_subscribe)
[![GitHub followers](https://img.shields.io/github/followers/r37r0m0d3l.svg?style=social&label=Follow)](https://github.com/r37r0m0d3l/publish_subscribe)
[![GitHub forks](https://img.shields.io/github/forks/r37r0m0d3l/publish_subscribe.svg?style=social&label=Fork)]()
[![Twitter](https://img.shields.io/twitter/follow/r37r0m0d3l.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=r37r0m0d3l)

## Usage

Installation

```bash
npm install publish_subscribe
```

CommonJS

```js
const PublishSubscribe = require("@r37r0m0d3l/publish_subscribe").default;
```

ECMAScript Modules

```typescript
import { PublishSubscribe } from "@r37r0m0d3l/publish_subscribe/es";
```

```js
const pubsub = new PublishSubscribe();
```

Logging

```js
pubsub.setLogging((info) => {
  console.group("LOGGING!!!");
  console.log(info);
  console.groupEnd();
});

pubsub.disableLogging();
```

Naming channels

```js
const CHANNEL_NAME_AS_STRING = "TheChannelName";
const CHANNEL_NAME_AS_NUMBER = 123;
const CHANNEL_NAME_AS_SYMBOL = Symbol("ThisChannelProbablyPrivateToModule");
const CHANNEL = "app";
```

Synchronous subscription

```js
const tokenOfSynchronous = pubsub.subscribe(CHANNEL, function sync(data, channel, token) {
  return { message: "Here can by any kind data for synchronous functions" };
});
```

Asynchronous subscription

```js
const tokenOfAsynchronous = pubsub.subscribe(CHANNEL, async (data, channel, token) => {
  return "Here can by any kind data for asynchronous functions";
});
```

Reusable subscription

```js
function synchronousCallback(data, channel, token) {
  // And here is no any data returned
}
const tokenOfSynchronousCallback = pubsub.subscribe(CHANNEL, synchronousCallback);
```

No need for token as subscription will expire after first successful call

```js
pubsub.subscribeOnce(CHANNEL, synchronousCallback);
```

Intercept all publishing

```js
pubsub.onPublish((channel, data) => {
  // All publishing will be intercepted here
  // and you can do your message matching here
});

pubsub.onPublish(); // now its disabled
```

Get synchronous results from subscribers

```js
const results = pubsub.publishSync(CHANNEL, { data: "the data" }, true, true, (results) => {
  // Only synchronous functions will be called!
  // Array of results can be intercepted in callback
});
console.log(results); // or can be accessed as function call
```

Get synchronous and asynchronous results from subscribers

```js
pubsub.publishAsync(CHANNEL, { data: "the data" }, false).then((results) => {
  // results here also contain additional array of data from subscribers i.e.
  // [ { channel: "app", result: "data from subscriber", token: "zzroUP97lnxL0VUa" } ]
});
```

Do not wait anything from subscribers

```js
pubsub.publish(CHANNEL, { data: "the data" });
```

Retrieve callback via token

```js
const callback = pubsub.getCallback(tokenOfSynchronousCallback);
```

Unsubscribe

```js
// Unsubscribe via token previously retrieved from `subscribe` method

pubsub.unsubscribeByToken(tokenOfSynchronous);

// All subscriptions based on callback will be removed

pubsub.unsubscribeByChannelAndCallback(CHANNEL, synchronousCallback);

// This callback function will be removed from all subscriptions

pubsub.unsubscribeByCallback(synchronousCallback);

// Unsubscribe based on parameters provided

pubsub.unsubscribe(callbackChannelToken, callback);
```

Has any subscriptions

```js
pubsub.hasSubscription(CHANNEL);
```

Has channel

```js
pubsub.hasChannel(CHANNEL);
```

Get list of channels

```js
pubsub.getChannels();
```

Drop channel

```js
pubsub.dropChannel(CHANNEL);
```

Clear instance

```js
pubsub.dropAll();
```

## About

Yet another publish/subscribe library? Why this library exists:

- Prevent published data changes between subscriptions.

- Possibility to publish asynchronously.

- Possibility to do sync publish and receive data from subscriptions.

- Custom logging into console for most actions.

- Possibility to publish async events.

- Possibility to use async callbacks in subscriptions.

- Get subscription callback function by token and use it somewhere else.

- Possibility to use finite numbers, strings or symbols as channel names.

- Subscription functions receive callback token among channel name and published data.

- Has _subscribeOnce_ method.

- Has _onPublish_ method for _global message matching_.

- Error swallowing. Publish/subscribe pattern should not broke on some function somewhere deep in code.

- Almost dependency free. This library will work even if the last commit was ten years ago.

- TypeScript definitions.

The **worst** things that can happen to pub/sub library that is **not** here:

- Multiple subscriptions for one channel. Somehow it does not exists in other libraries.

- Event inheritance. This should be handled by subscription callbacks not by the pub/sub system.

- Hellish _wildcards_ - _hierarchical addressing_ - _messages matching_ for each event. First of all this is impossible with numbers or symbols. And this makes no sense as you can create root channel name anyway. I.e. when you publish "app:user:registered" and "app:user:login", just publish "app:user" among others. While when you publish "app:user:re-login", do not publish "app:user" and "re-login" event will be kept _private_ or _unimportant_ to others.

- Possibility to define context for each callback. You have arrow functions for that. You should not save context in one place and take it hostage. Probably you should use global variables instead etc.

- Cancel publish event distribution for subscribers. This behavior reserved for Observer pattern.

- No order priority for subscriptions. Somehow pattern should be about decoupling, but sometimes it has it in.

The things you may not like:

- No ECMAScript 3 / ECMAScript 5 / Internet Explorer 6 compatibility. You can transpile library to CommonJS module via Babel with configuration you need.
