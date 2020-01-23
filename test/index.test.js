const PublishSubscribe = require("../dist/publish_subscribe.cjs").default;

describe("calling and printing", () => {
  it("should not crash on call", () => {
    const pubsub = new PublishSubscribe();
    expect(pubsub.hasChannel("dummy")).toBe(false);
  });
});
