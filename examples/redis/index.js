//#region File Where You creating Instance
const redis = require("redis");
const { PublishSubscribe } = require("@r37r0m0d3l/publish_subscribe");

const CHANNEL = "main";

const globalPubSub = new PublishSubscribe();
const publisher = redis.createClient();
const subscriber = redis.createClient();

globalPubSub.subscribe("redis:start", function() {
  console.log("#2 Redis Publish Subscribe started!");
  //#region Here application is started
  globalPubSub.publish(`redis:publish:${CHANNEL}`, "First Message");
  globalPubSub.publish(`redis:publish:${CHANNEL}`, {
    info: "Second Message"
  });
  setTimeout(function() {
    globalPubSub.publish(`redis:quit`);
  }, 2000);
  //#endregion
});

globalPubSub.subscribe(`redis:quit`, (message, channel) => {
  console.group("#4 Redis is about to quit!");
  subscriber.unsubscribe();
  subscriber.quit();
  publisher.quit();
  process.exit(0);
});

subscriber.on("subscribe", function() {
  console.log("#1 Redis Subscribed!");
  globalPubSub.publish("redis:start");
});

subscriber.on("message", function(channel, message) {
  let data = message;
  try {
    data = JSON.parse(message);
  } catch (err) {
    //
  }
  globalPubSub.publish(`redis:channel:${CHANNEL}`, data);
});

globalPubSub.subscribe(`redis:publish:${CHANNEL}`, (message, channel) => {
  const redisChannel = channel.split("redis:publish:").pop();
  let redisMessage = message;
  if (typeof message !== "string") {
    redisMessage = JSON.stringify(message);
  }
  publisher.publish(redisChannel, redisMessage);
});

subscriber.subscribe(CHANNEL);
//#endregion

//#region Any Other File in your Project
globalPubSub.subscribe(`redis:channel:${CHANNEL}`, function(message, channel) {
  console.group("#3 Redis has message!");
  console.log(`Channel:`);
  console.log(`"${channel}"`);
  console.log(`Message:`);
  console.dir(message);
  console.groupEnd();
});
setTimeout(function() {
  globalPubSub.publish(`redis:publish:${CHANNEL}`, {
    info: "Third Message"
  });
}, 1000);
//#endregion

/*
Console output

#1 Redis Subscribed!
#2 Redis Publish Subscribe started!
#3 Redis has message!
  Channel:
  "redis:channel:main"
  Message:
  'First Message'
#3 Redis has message!
  Channel:
  "redis:channel:main"
  Message:
  { info: 'Second Message' }
#3 Redis has message!
  Channel:
  "redis:channel:main"
  Message:
  { info: 'Third Message' }
#4 Redis is about to quit!

*/
