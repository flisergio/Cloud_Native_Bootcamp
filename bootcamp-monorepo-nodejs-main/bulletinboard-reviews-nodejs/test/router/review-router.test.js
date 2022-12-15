/* eslint-disable no-trailing-spaces */
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
import { FIRST_REVIEW, SECOND_REVIEW } from "../reviews.js";
import logger from "../../lib/util/logger.js";
import PostgresReviewStorage from "../../lib/storage/postgres-review-storage.js";
import application from "../../lib/application.js";
import IllegalArgumentError from "../../lib/error/illegal-argument-error.js";
import RabbitMQClient from "../../lib/mq/rabbitmq-client.js";

const MOUNT_PATH = "/api/v1/reviews";

describe("review-router", () => {
  const sandbox = sinon.createSandbox();

  let loggerStub = null;
  let storageStub = null;
  let MQClientStub = null;
  let client = null;

  const maximumRequestsPossible = 1;

  beforeEach(() => {
    loggerStub = sandbox.stub(logger);
    loggerStub.child.returnsThis();
    storageStub = sandbox.createStubInstance(PostgresReviewStorage);
    MQClientStub = sandbox.createStubInstance(RabbitMQClient);
    const app = application(storageStub, MQClientStub, loggerStub, maximumRequestsPossible);
    client = supertest(app);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("post /", () => {
    it("should reject with an error when creating an invalid review", async () => {
      for (const key of Object.keys(FIRST_REVIEW)) {
        const invalid = {
          [key]: null,
        };
        const invalidReview = {
          ...FIRST_REVIEW,
          ...invalid,
        };
        const message = util.format("Invalid review: %O", invalidReview);
        const error = new IllegalArgumentError(message);
        storageStub.create.withArgs(invalidReview).rejects(error);
        const code = 400;
        const { text } = await client
          .post(MOUNT_PATH)
          .send(invalidReview)
          .expect(code)
          .expect("Content-Type", /text\/plain/);
        assert.equal(text, STATUS_CODES[code]);
      }
    });

    it("should create a review and send the average rating to the MQ", async () => {
      const id = 1;
      storageStub.create.withArgs(FIRST_REVIEW).resolves(id);
      storageStub.getAverageRating
        .withArgs(FIRST_REVIEW.revieweeEmail)
        .resolves({ averageRating: FIRST_REVIEW.rating });
      MQClientStub.sendAverageRatingFor
        .withArgs(FIRST_REVIEW.revieweeEmail, FIRST_REVIEW.rating)
        .resolves();
      const { body } = await client
        .post(MOUNT_PATH)
        .send(FIRST_REVIEW)
        .expect(201)
        .expect("Content-Type", /application\/json/)
        .expect("Location", `${MOUNT_PATH}/${id}`);
      assert.equal(
        storageStub.getAverageRating.withArgs(FIRST_REVIEW.revieweeEmail)
          .calledOnce,
        true
      );
      assert.equal(
        MQClientStub.sendAverageRatingFor.withArgs(
          FIRST_REVIEW.revieweeEmail,
          FIRST_REVIEW.rating
        ).calledOnce,
        true
      );
      assert.deepEqual(body, {
        id,
        ...FIRST_REVIEW,
      });
    });
  });

  describe("get /", () => {
    it("should read a list of reviews", async () => {
      const [id1, id2] = [1, 2];
      const reviews = [
        {
          id: id1,
          ...FIRST_REVIEW,
        },
        {
          id: id2,
          ...SECOND_REVIEW,
        },
      ];
      storageStub.readAll.resolves(reviews);
      const { body } = await client
        .get(MOUNT_PATH)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, reviews);
    });
  });

  describe("get /:revieweeEmail", () => {
    it("should read a list of reviews for given reviewee email", async () => {
      const { revieweeEmail } = FIRST_REVIEW;
      const id = 1;
      const reviews = [
        {
          id,
          ...FIRST_REVIEW,
        },
      ];
      storageStub.readAllFor.withArgs(revieweeEmail).resolves(reviews);
      const { body } = await client
        .get(`${MOUNT_PATH}/${revieweeEmail}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, reviews);
    });
  });

  describe("delete /", () => {
    it("delete all reviews", async () => {
      storageStub.deleteAll.resolves();
      const { body } = await client
        .delete(MOUNT_PATH)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, "");
    });
  });
});
