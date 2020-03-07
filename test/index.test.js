const { PublishSubscribe } = require("../dist/publish_subscribe.cjs");

describe("calling and printing", () => {
  it("should not crash on call", () => {
    const pubsub = new PublishSubscribe();
    pubsub.subscribe("dummy", () => {});
    expect(pubsub.hasChannel("dummy")).toBe(true);
  });
});
