/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import assert from "assert/strict";
import util from "util";
import { STATUS_CODES } from "http";
import sinon from "sinon";
import supertest from "supertest";
import logger from "../../lib/util/logger.js";
import PostgresAdStorage from "../../lib/storage/postgres-ad-storage.js";
import ReviewsClient from "../../lib/client/reviews-client.js";
import application from "../../lib/application.js";
import IllegalArgumentError from "../../lib/error/illegal-argument-error.js";
import NotFoundError from "../../lib/error/not-found-error.js";
import { WOLLY_SOCKS, USED_SHOES } from "../data/ads.js";

const REVIEWS_ENDPOINT = "http://localhost:9090";
const AVERAGE_RATING = 3.1415;

const getTransientProps = ({ contact }) => ({
  averageContactRating: AVERAGE_RATING,
  reviewsUrl: `${REVIEWS_ENDPOINT}/#/reviews/${contact}`,
});

describe("ad-router", () => {
  const sandbox = sinon.createSandbox();

  let storageStub = null;
  let reviewsClient = null;
  let loggerStub = null;
  let client = null;

  beforeEach(() => {
    storageStub = sandbox.createStubInstance(PostgresAdStorage);
    reviewsClient = sandbox.createStubInstance(ReviewsClient, {
      getEndpoint: REVIEWS_ENDPOINT,
      getAverageRating: Promise.resolve(AVERAGE_RATING),
    });
    storageStub.readAvgRatingFor.resolves(AVERAGE_RATING);
    reviewsClient = sandbox.createStubInstance(ReviewsClient, {
      getEndpoint: REVIEWS_ENDPOINT,
    });
    loggerStub = sandbox.stub(logger);
    loggerStub.child.returnsThis();
    const app = application(storageStub, reviewsClient, loggerStub);
    client = supertest(app);
  });

  afterEach(() => sandbox.restore());

  describe("post /", () => {
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
        storageStub.create.withArgs(invalidAd).rejects(error);
        const code = 400;
        const { text } = await client
          .post("/api/v1/ads")
          .send(invalidAd)
          .expect(code)
          .expect("Content-Type", /text\/plain/);
        assert.equal(text, STATUS_CODES[code]);
      }
    });

    it("should create an ad", async () => {
      const id = 1;
      storageStub.create.withArgs(WOLLY_SOCKS).resolves(id);
      const { body } = await client
        .post("/api/v1/ads")
        .send(WOLLY_SOCKS)
        .expect(201)
        .expect("Content-Type", /application\/json/)
        .expect("Location", `/api/v1/ads/${id}`);
      assert.deepEqual(body, {
        id,
        ...WOLLY_SOCKS,
        ...getTransientProps(WOLLY_SOCKS),
      });
    });
  });

  describe("get /", () => {
    it("should read a list of ads", async () => {
      const [id1, id2] = [1, 2];
      const ads = [
        {
          id: id1,
          ...WOLLY_SOCKS,
          ...getTransientProps(WOLLY_SOCKS),
        },
        {
          id: id2,
          ...USED_SHOES,
          ...getTransientProps(USED_SHOES),
        },
      ];
      storageStub.readAll.resolves(ads);
      const { body } = await client
        .get("/api/v1/ads")
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, ads);
    });
  });

  describe("get /:id", () => {
    it("should reject with an error when reading an invalid id", async () => {
      const id = "Not-A-Number";
      const message = util.format("Invalid id: %s", id);
      const error = new IllegalArgumentError(message);
      storageStub.read.withArgs(NaN).rejects(error);
      const code = 400;
      const { text } = await client
        .get(`/api/v1/ads/${id}`)
        .expect(code)
        .expect("Content-Type", /text\/plain/);
      assert.equal(text, STATUS_CODES[code]);
    });

    it("should reject with an error when reading a non-existing ad", async () => {
      const id = 42;
      const message = util.format("No ad found for id: %s", id);
      const error = new NotFoundError(message);
      storageStub.read.withArgs(id).rejects(error);
      const code = 404;
      const { text } = await client
        .get(`/api/v1/ads/${id}`)
        .expect(code)
        .expect("Content-Type", /text\/plain/);
      assert.equal(text, STATUS_CODES[code]);
    });

    it("should read an ad", async () => {
      const id = 1;
      const ad = {
        id,
        ...WOLLY_SOCKS,
      };
      storageStub.read.withArgs(id).resolves(ad);
      const { body } = await client
        .get(`/api/v1/ads/${id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, {
        ...ad,
        ...getTransientProps(ad),
      });
    });
  });

  describe("put /:id", () => {
    it("should reject with an error when updating an invalid id", async () => {
      const id = "Not-A-Number";
      const message = util.format("Invalid id: %s", id);
      const error = new IllegalArgumentError(message);
      storageStub.update.withArgs(NaN, WOLLY_SOCKS).rejects(error);
      const code = 400;
      const { text } = await client
        .put(`/api/v1/ads/${id}`)
        .send(WOLLY_SOCKS)
        .expect(code)
        .expect("Content-Type", /text\/plain/);
      assert.equal(text, STATUS_CODES[code]);
    });

    it("should reject with an error when updating a non-existing ad", async () => {
      const id = 42;
      const message = util.format("No ad found for id: %s", id);
      const error = new NotFoundError(message);
      storageStub.update.withArgs(id, WOLLY_SOCKS).rejects(error);
      const code = 404;
      const { text } = await client
        .put(`/api/v1/ads/${id}`)
        .send(WOLLY_SOCKS)
        .expect(code)
        .expect("Content-Type", /text\/plain/);
      assert.equal(text, STATUS_CODES[code]);
    });

    it("should reject with an error when updating an invalid ad", async () => {
      const id = 1;
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
        storageStub.update.withArgs(id, invalidAd).rejects(error);
        const code = 400;
        const { text } = await client
          .put(`/api/v1/ads/${id}`)
          .send(invalidAd)
          .expect(code)
          .expect("Content-Type", /text\/plain/);
        assert.equal(text, STATUS_CODES[code]);
      }
    });

    it("should update an ad", async () => {
      const id = 1;
      storageStub.update.withArgs(id, WOLLY_SOCKS).resolves();
      const { body } = await client
        .put(`/api/v1/ads/${id}`)
        .send(WOLLY_SOCKS)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, "");
    });
  });

  describe("delete /", () => {
    it("delete all ads", async () => {
      storageStub.deleteAll.resolves();
      const { body } = await client
        .delete("/api/v1/ads")
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, "");
    });
  });

  describe("delete /:id", () => {
    it("should reject with an error when deleting an invalid id", async () => {
      const id = "Not-A-Number";
      const message = util.format("Invalid id: %s", id);
      const error = new IllegalArgumentError(message);
      storageStub.delete.withArgs(NaN).rejects(error);
      const code = 400;
      const { text } = await client
        .delete(`/api/v1/ads/${id}`)
        .expect(code)
        .expect("Content-Type", /text\/plain/);
      assert.equal(text, STATUS_CODES[code]);
    });

    it("should reject with an error when deleting a non-existing ad", async () => {
      const id = 42;
      const message = util.format("No ad found for id: %s", id);
      const error = new NotFoundError(message);
      storageStub.delete.withArgs(id).rejects(error);
      const code = 404;
      const { text } = await client
        .delete(`/api/v1/ads/${id}`)
        .expect(code)
        .expect("Content-Type", /text\/plain/);
      assert.equal(text, STATUS_CODES[code]);
    });

    it("should delete an ad", async () => {
      const id = 1;
      storageStub.delete.withArgs(id).resolves();
      const { body } = await client
        .delete(`/api/v1/ads/${id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, "");
    });
  });
});
