// @todo Work In Progress

import io from "socket.io-client";
import { PublishSubscribe } from "@r37r0m0d3l/publish_subscribe";
const socket = io("ws://localhost:3000");
const pubsub = new PublishSubscribe();
pubsub.onPublish((channel, data) => {
  const [root, ...breadcrumbs] = channel.split("/");
  switch (root) {
    case "websocket":
      console.log({ channel, data, breadcrumbs });
      break;
  }
});
socket.on("connect", function() {
  pubsub.publish("websocket/connect");
});
socket.on("close", function() {
  pubsub.publish("websocket/close");
});
socket.on("event_from_server", (data) => {
  pubsub.publish("websocket/event_from_server", data);
});
pubsub.subscribe("websocket/event_from_client", () => {
  socket.emit("event_from_client", { data: "Hello Server" });
});
pubsub.subscribe("websocket/connect", () => {
  pubsub.publish("websocket/event_from_client", { data: "Hello Client" });
});
