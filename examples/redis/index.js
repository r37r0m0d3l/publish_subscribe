//#region File Where You're creating Instance
import redis from "redis";

import { PublishSubscribe } from "@r37r0m0d3l/publish_subscribe";

const CHANNEL = "main";

const globalPubSub = new PublishSubscribe();
const publisher = redis.createClient();
const subscriber = redis.createClient();

await Promise.all([
  publisher.connect(),
  subscriber.connect()
]);

globalPubSub.subscribe("redis:start", function() {
  console.log("#2 Redis Publish Subscribe started!");
  //#region Here application is started
  globalPubSub.publish(`redis:publish:${CHANNEL}`, "First Message");
  globalPubSub.publish(`redis:publish:${CHANNEL}`, {
    info: "Second Message"
  });
  setTimeout(function() {
    globalPubSub.publish(`redis:quit`);
  }, 2_000);
  //#endregion
});

globalPubSub.subscribe(`redis:quit`, async (message, channel) => {
  console.group("#4 Redis is about to quit!");
  await subscriber.unsubscribe();
  await subscriber.quit();
  await publisher.quit();
  process.exit(0);
});

globalPubSub.subscribe(`redis:publish:${CHANNEL}`, async (message, channel) => {
  const redisChannel = channel.split("redis:publish:").pop();
  let redisMessage = message;
  if (typeof message !== "string") {
    redisMessage = JSON.stringify(message);
  }
  await publisher.publish(redisChannel, redisMessage);
});

await subscriber.subscribe(CHANNEL, function(message, channel) {
  let data = message;
  try {
    data = JSON.parse(message);
  } catch (err) {
    //
  }
  globalPubSub.publish(`redis:channel:${CHANNEL}`, data);
});

console.log("#1 Redis Subscribed!");
globalPubSub.publish("redis:start");

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

globalPubSub.publish(`redis:publish:${CHANNEL}`, "Third", undefined, true);
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
