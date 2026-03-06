import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { PublishSubscribe } from "../dist/publish_subscribe.js";

describe("PublishSubscribe Core Functionality", () => {
  let pubSub;

  beforeEach(() => {
    pubSub = new PublishSubscribe();
  });

  describe("Channel Management", () => {
    it("should initially have no channels", () => {
      assert.deepStrictEqual(pubSub.getChannels(), []);
    });

    it("should add a channel when subscribing", () => {
      pubSub.subscribe("test", () => {});
      assert.strictEqual(pubSub.hasChannel("test"), true);
      assert.deepStrictEqual(pubSub.getChannels(), ["test"]);
    });

    it("should support multiple channels and sort them", () => {
      pubSub.subscribe("b", () => {});
      pubSub.subscribe("a", () => {});
      pubSub.subscribe("c", () => {});
      assert.deepStrictEqual(pubSub.getChannels(), ["a", "b", "c"]);
    });

    it("should support numeric channels", () => {
      pubSub.subscribe(1, () => {});
      assert.strictEqual(pubSub.hasChannel(1), true);
    });

    it("should support symbol channels but not return them in getChannels", () => {
      const sym = Symbol("test");
      pubSub.subscribe(sym, () => {});
      assert.strictEqual(pubSub.hasChannel(sym), true);
      assert.deepStrictEqual(pubSub.getChannels(), []);
    });

    it("should drop a channel", () => {
      pubSub.subscribe("test", () => {});
      pubSub.dropChannel("test");
      assert.strictEqual(pubSub.hasChannel("test"), false);
      assert.deepStrictEqual(pubSub.getChannels(), []);
    });

    it("should drop all channels", () => {
      pubSub.subscribe("a", () => {});
      pubSub.subscribe("b", () => {});
      pubSub.dropAll();
      assert.deepStrictEqual(pubSub.getChannels(), []);
      assert.strictEqual(pubSub.hasChannel("a"), false);
      assert.strictEqual(pubSub.hasChannel("b"), false);
    });
  });

  describe("Subscription Management", () => {
    it("should return a token on subscription", () => {
      const token = pubSub.subscribe("test", () => {});
      assert.strictEqual(typeof token, "string");
      assert.strictEqual(token.length, 16);
    });

    it("should detect if a channel has subscriptions", () => {
      assert.strictEqual(pubSub.hasSubscription("test"), false);
      pubSub.subscribe("test", () => {});
      assert.strictEqual(pubSub.hasSubscription("test"), true);
    });

    it("should get callback by token", () => {
      const cb = () => "hello";
      const token = pubSub.subscribe("test", cb);
      assert.strictEqual(pubSub.getCallback(token), cb);
    });

    it("should unsubscribe by token", () => {
      const token = pubSub.subscribe("test", () => {});
      assert.strictEqual(pubSub.hasSubscription("test"), true);
      const deletedCount = pubSub.unsubscribe(token);
      assert.strictEqual(deletedCount, 1);
      assert.strictEqual(pubSub.hasSubscription("test"), false);
    });

    it("should unsubscribe by callback", () => {
      const cb = () => {};
      pubSub.subscribe("test1", cb);
      pubSub.subscribe("test2", cb);
      assert.strictEqual(pubSub.hasSubscription("test1"), true);
      assert.strictEqual(pubSub.hasSubscription("test2"), true);
      const deletedCount = pubSub.unsubscribe(cb);
      assert.strictEqual(deletedCount, 2);
      assert.strictEqual(pubSub.hasSubscription("test1"), false);
      assert.strictEqual(pubSub.hasSubscription("test2"), false);
    });

    it("should unsubscribe by channel and callback", () => {
      const cb = () => {};
      pubSub.subscribe("test1", cb);
      pubSub.subscribe("test2", cb);
      const deletedCount = pubSub.unsubscribe("test1", cb);
      assert.strictEqual(deletedCount, 1);
      assert.strictEqual(pubSub.hasSubscription("test1"), false);
      assert.strictEqual(pubSub.hasSubscription("test2"), true);
    });
  });

  describe("Publishing", () => {
    it("should publish data to subscribers", (context, done) => {
      const testData = { foo: "bar" };
      pubSub.subscribe("test", (data) => {
        assert.deepStrictEqual(data, testData);
        done();
      });
      pubSub.publish("test", testData);
    });

    it("should publish to multiple subscribers", (context, done) => {
      let count = 0;
      const checkDone = () => {
        count++;
        if (count === 2) done();
      };
      pubSub.subscribe("test", checkDone);
      pubSub.subscribe("test", checkDone);
      pubSub.publish("test");
    });

  it("should support subscribeOnce", async (context) => {
    let count = 0;
    pubSub.subscribeOnce("test", () => {
      count++;
    });
    pubSub.publish("test");

    await new Promise(resolve => setTimeout(resolve, 50));
    assert.strictEqual(count, 1, "Should have been called once after first publish");

    pubSub.publish("test");
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.strictEqual(count, 1, "Should NOT have been called again after second publish");
  });

    it("should support sticky publishing (onSubscribe)", (context, done) => {
      const testData = { sticky: true };
      pubSub.publish("test", testData, true, true); // sticky = true

      pubSub.subscribe("test", (data) => {
        assert.deepStrictEqual(data, testData);
        done();
      });
    });

    it("should support manual onSubscribe", (context, done) => {
        const testData = { manual: true };
        pubSub.onSubscribe("test", testData);

        pubSub.subscribe("test", (data) => {
          assert.deepStrictEqual(data, testData);
          done();
        });
    });

    it("should support publishSync", (context, done) => {
        let callCount = 0;
        pubSub.subscribe("test", (data) => {
            callCount++;
            return "result " + data;
        });

        pubSub.publishSync("test", "sync", true, true, (results) => {
            assert.strictEqual(callCount, 1);
            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].result, "result sync");
            done();
        });
    });

    it("should support publishAsync", async () => {
        pubSub.subscribe("test", async (data) => {
            return "async " + data;
        });

        const results = await pubSub.publishAsync("test", "data", true);
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].result, "async data");
    });
  });

  describe("Logging", () => {
      it("should call logging callback if enabled", (context, done) => {
          pubSub.setLogging((info) => {
              if (info.method === "subscribe") {
                  assert.strictEqual(info.channel, "test");
                  done();
              }
          });
          pubSub.subscribe("test", () => {});
      });

      it("should not call logging if disabled", () => {
          let called = false;
          pubSub.setLogging(() => {
              called = true;
          });
          pubSub.disableLogging();
          pubSub.subscribe("test", () => {});
          assert.strictEqual(called, false);
      });
  });

  describe("onPublish global hook", () => {
      it("should call onPublish callback for any publish", (context, done) => {
          pubSub.onPublish((channel, data) => {
              assert.strictEqual(channel, "test");
              assert.strictEqual(data, "hello");
              done();
          });
          pubSub.publish("test", "hello");
      });
  });

  describe("Edge Cases and Errors", () => {
      it("should return TypeError for invalid channel in subscribe", () => {
          const result = pubSub.subscribe(null, () => {});
          assert.ok(result instanceof TypeError);
      });

      it("should return TypeError for invalid callback in subscribe", () => {
          const result = pubSub.subscribe("test", "not a function");
          assert.ok(result instanceof TypeError);
      });

      it("should throw TypeError for invalid channel in onSubscribe", () => {
          assert.throws(() => {
              pubSub.onSubscribe(null, {});
          }, TypeError);
      });

      it("should handle publishing to non-existent channel", () => {
          // Should not throw
          pubSub.publish("non-existent", "data");
          assert.strictEqual(pubSub.hasChannel("non-existent"), false);
      });
  });
});
