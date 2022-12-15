/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import assert from "assert/strict";
import sinon from "sinon";
import supertest from "supertest";
import { FIRST_REVIEW } from "../reviews.js";
import logger from "../../lib/util/logger.js";
import PostgresReviewStorage from "../../lib/storage/postgres-review-storage.js";
import application from "../../lib/application.js";
import RabbitMQClient from "../../lib/mq/rabbitmq-client.js";

describe("average-rating-router", () => {
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

  describe("get /:revieweeEmail", () => {
    it("should read an ad", async () => {
      const expectedAverageRating = 13.37;
      const { revieweeEmail } = FIRST_REVIEW;
      storageStub.getAverageRating.withArgs(revieweeEmail).resolves({
        averageRating: expectedAverageRating,
      });
      const { body } = await client
        .get(`/api/v1/averageRatings/${revieweeEmail}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepEqual(body, {
        averageRating: expectedAverageRating,
      });
    });
  });

  describe("Rate Limiter", () => {
    it("should display a fail message after reaching maximum requests possible (1)", async () => {
      const { revieweeEmail } = FIRST_REVIEW;
      storageStub.getAverageRating.resolves({ averageRating: 3.48 });

      await client.get(`/api/v1/averageRatings/${revieweeEmail}`).expect(200);
      await client.get(`/api/v1/averageRatings/${revieweeEmail}`).expect(429);
    });
  });
});
