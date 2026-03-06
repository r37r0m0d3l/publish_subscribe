import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PublishSubscribe } from "../dist/publish_subscribe.js";

describe("calling and printing", () => {
  it("should not crash on call", () => {
    const pubSub = new PublishSubscribe();
    pubSub.subscribe("dummy", () => {});
    assert.strictEqual(pubSub.hasChannel("dummy"), true);
  });
});
