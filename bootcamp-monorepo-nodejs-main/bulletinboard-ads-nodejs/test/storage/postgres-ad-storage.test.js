/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import assert from "assert/strict";
import util from "util";
import sinon from "sinon";
import config from "../../lib/util/config.js";
import logger from "../../lib/util/logger.js";
import Pool from "../../lib/storage/pool.js";
import PostgresAdStorage from "../../lib/storage/postgres-ad-storage.js";
import IllegalArgumentError from "../../lib/error/illegal-argument-error.js";
import NotFoundError from "../../lib/error/not-found-error.js";
import { WOLLY_SOCKS, USED_SHOES } from "../data/ads.js";

describe("postgres-ad-storage", () => {
  const sandbox = sinon.createSandbox();

  let pool = null;
  let loggerStub = null;
  let storage = null;

  before(() => {
    const { postgres } = config;
    pool = new Pool(postgres);
  });

  beforeEach(async () => {
    loggerStub = sandbox.stub(logger);
    loggerStub.child.returnsThis();
    storage = new PostgresAdStorage(pool, loggerStub);
  });

  afterEach(async () => {
    await storage.deleteAll();
    sandbox.restore();
  });

  after(async () => {
    await pool.end();
  });

  describe("create", () => {
    it("should reject with an error when creating an invalid ad", async () => {
      for (const key of Object.keys(WOLLY_SOCKS)) {
        const invalid = {
          [key]: null,
        };
        const invalidAd = {
          ...WOLLY_SOCKS,
          ...invalid,
        };
        const message = util.format("Invalid ad: %O", invalidAd);
        const error = new IllegalArgumentError(message);
        await assert.rejects(storage.create(invalidAd), error);
      }
    });

    it("should create an ad", async () => {
      const id = await storage.create(WOLLY_SOCKS);
      const ads = await storage.readAll();
      assert.equal(ads.length, 1);
      assert.deepEqual(ads, [
        {
          id,
          ...WOLLY_SOCKS,
        },
      ]);
    });
  });

  describe("read", () => {
    it("should reject with an error when reading an invalid id", async () => {
      const id = "invalid";
      const message = util.format("Invalid id: %s", id);
      const error = new IllegalArgumentError(message);
      await assert.rejects(storage.read(id), error);
    });

    it("should reject with an error when reading a non-existing ad", async () => {
      const id = 42;
      const message = util.format("No ad found for id: %s", id);
      const error = new NotFoundError(message);
      await assert.rejects(storage.read(id), error);
    });

    it("should read an ad", async () => {
      const id = await storage.create(WOLLY_SOCKS);
      const ad = await storage.read(id);
      assert.deepEqual(ad, {
        id,
        ...WOLLY_SOCKS,
      });
    });
  });

  describe("readAll", () => {
    it("should read all ads", async () => {
      const [id1, id2] = await Promise.all([
        storage.create(WOLLY_SOCKS),
        storage.create(USED_SHOES),
      ]);
      const ads = await storage.readAll();
      assert.equal(ads.length, 2);
      assert.deepEqual(ads, [
        {
          id: id1,
          ...WOLLY_SOCKS,
        },
        {
          id: id2,
          ...USED_SHOES,
        },
      ]);
    });
  });

  describe("update", () => {
    it("should reject with an error when updating an invalid id", async () => {
      const id = "invalid";
      const message = util.format("Invalid id: %s", id);
      const error = new IllegalArgumentError(message);
      await assert.rejects(storage.update(id, { price: 10 }), error);
    });

    it("should reject with an error when updating a non-existing ad", async () => {
      const id = 42;
      const message = util.format("No ad found for id: %s", id);
      const error = new NotFoundError(message);
      await assert.rejects(storage.update(id, { price: 10 }), error);
    });

    it("should reject with an error when updating an invalid ad", async () => {
      const id = await storage.create(WOLLY_SOCKS);
      for (const key of Object.keys(WOLLY_SOCKS)) {
        const invalid = {
          [key]: null,
        };
        const invalidAd = {
          ...WOLLY_SOCKS,
          ...invalid,
        };
        const message = util.format("Invalid ad: %O", invalidAd);
        const error = new IllegalArgumentError(message);
        await assert.rejects(storage.update(id, invalidAd), error);
      }
    });

    it("should update an ad", async () => {
      const id = await storage.create(WOLLY_SOCKS);
      const update = {
        ...WOLLY_SOCKS,
        price: 10,
      };
      await storage.update(id, update);
      const ad = await storage.read(id);
      assert.deepEqual(ad, {
        id,
        ...update,
      });
    });
  });

  describe("delete", () => {
    it("should reject with an error when deleting an invalid id", async () => {
      const id = "invalid";
      const message = util.format("Invalid id: %s", id);
      const error = new IllegalArgumentError(message);
      await assert.rejects(storage.delete(id), error);
    });

    it("should reject with an error when deleting a non-existing ad", async () => {
      const id = 42;
      const message = util.format("No ad found for id: %s", id);
      await assert.rejects(storage.delete(id), new NotFoundError(message));
    });

    it("should delete an ad", async () => {
      const id = await storage.create(WOLLY_SOCKS);
      await storage.delete(id);
      await assert.rejects(() => storage.read(id), NotFoundError);
    });
  });

  describe("deleteAll", () => {
    it("should delete all ads", async () => {
      await Promise.all([
        storage.create(WOLLY_SOCKS),
        storage.create(USED_SHOES),
      ]);
      let ads = await storage.readAll();
      assert.equal(ads.length, 2);
      await storage.deleteAll();
      ads = await storage.readAll();
      assert.equal(ads.length, 0);
      assert.deepEqual(await storage.readAll(), []);
    });
  });

  describe("readAvgRatingFor", () => {
    it("should throw an error if contact is wrong", async () => {
      await assert.rejects(storage.readAvgRatingFor(100));
    });

    it("should return 0 when contact does not exist", async () => {
      const avgRating = await storage.readAvgRatingFor(
        "this-is@notexisting.com"
      );
      assert.equal(avgRating, 0);
    });

    it("should read an average rating for specific contact", async () => {
      await storage.writeAvgRatingFor("me@sap.com", 3);
      const avgRating = await storage.readAvgRatingFor("me@sap.com");
      assert.equal(avgRating, 3);
    });
  });

  describe("writeAvgRatingFor", () => {
    it("should throw an error if contact is wrong", async () => {
      await assert.rejects(storage.writeAvgRatingFor(100, 3));
    });

    it("should throw an error when average rating is invalid", async () => {
      await assert.rejects(storage.writeAvgRatingFor("me@sap.com", "string"));
    });

    it("should create a new contactrating and return its average rating", async () => {
      await storage.writeAvgRatingFor("me@sap.com", 3);
      const avgRating = await storage.readAvgRatingFor("me@sap.com");
      assert.equal(avgRating, 3);
    });

    it("should reassign an average rating when selected contact already has one", async () => {
      await storage.writeAvgRatingFor("me@sap.com", 5);
      await storage.writeAvgRatingFor("me@sap.com", 4);
      const avgRating = await storage.readAvgRatingFor("me@sap.com");
      assert.equal(avgRating, 4);
    });
  });
});
