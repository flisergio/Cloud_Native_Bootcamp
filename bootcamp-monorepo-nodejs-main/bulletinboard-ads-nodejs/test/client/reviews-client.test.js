/* eslint-disable one-var */
/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import assert from "assert/strict";
import sinon from "sinon";
import logger from "../../lib/util/logger.js";
import ReviewsClient from "../../lib/client/reviews-client.js";

const CONFIG = {
    endpoint: "http://localhost:9090",
    fallback: {
      timeout: 50,
      defaultAverageRating: 1.0,
    },
    retry: {
      attempts: 5,
      interval: 50,
    },
  },
  AVERAGE_RATING = 3.1415;

describe("reviews-client", () => {
  const sandbox = sinon.createSandbox();

  let fetchStub = null;
  let loggerStub = null;
  let reviewsClient = null;

  beforeEach(() => {
    fetchStub = sandbox.stub();
    loggerStub = sandbox.stub(logger);
    loggerStub.child.returnsThis();
    reviewsClient = new ReviewsClient(CONFIG, fetchStub, loggerStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should create a reviews client", () => {
    assert.ok(reviewsClient instanceof ReviewsClient);
  });

  it("should get the reviews endpoint", () => {
    const endpoint = reviewsClient.getEndpoint();
    assert.equal(endpoint, CONFIG.endpoint);
  });

  // it("should get the average rating for a contact", async () => {
  //   const contact = "foo@bar.de";
  //   const jsonStub = sandbox.stub().resolves({ averageRating: AVERAGE_RATING });
  //   fetchStub
  //     .withArgs(`${REVIEWS_ENDPOINT}/api/v1/averageRatings/${contact}`)
  //     .resolves({
  //       json: jsonStub,
  //     });
  //   const averageRating = await reviewsClient.getAverageRating(contact);
  //   assert.equal(averageRating, AVERAGE_RATING);
  // });

  describe("Resilience Fallback scenario", () => {
    it("should return default average rating for a contact when fetch error took place", async () => {
      fetchStub.rejects(new Error("Fetch Error"));
      const averageRating = await reviewsClient.getAverageRatingFallback(
        "some-error@sap.com"
      );

      assert.equal(averageRating, CONFIG.fallback.defaultAverageRating);
    });

    it("should return default average rating for a contact when fetch timeout took place", async () => {
      fetchStub.returns(new Promise(() => {}));
      const averageRating = await reviewsClient.getAverageRatingFallback(
        "some-timeout@sap.com"
      );

      assert.equal(averageRating, CONFIG.fallback.defaultAverageRating);
    });

    it("should return the average rating for a contact in a successful scenario", async () => {
      const contact = "success-fallback@sap.com";
      fetchStub
        .withArgs(`${CONFIG.endpoint}/api/v1/averageRatings/${contact}`)
        .resolves({
          status: 200,
          json: sandbox.stub().resolves({ averageRating: AVERAGE_RATING }),
        });
      const averageRating = await reviewsClient.getAverageRatingFallback(
        contact
      );

      assert.equal(averageRating, AVERAGE_RATING);
    });
  });

  describe("Resilience Retry scenario", () => {
    it("should reject with an error for all attempts", async () => {
      fetchStub.rejects(new Error("Retry Error"));

      await assert.rejects(
        reviewsClient.getAverageRatingRetry("some-error@sap.com")
      );
    });

    it("should return the average rating for a contact in a successful scenario after failing two attempts", async () => {
      const contact = "success-retry@sap.com";
      fetchStub.onFirstCall().rejects(new Error("Retry error"));
      fetchStub.onSecondCall().rejects(new Error("Retry error"));
      fetchStub.onThirdCall().resolves({
        status: 200,
        json: sandbox.stub().resolves({ averageRating: AVERAGE_RATING }),
      });

      const averageRating = await reviewsClient.getAverageRatingRetry(contact);
      assert.equal(averageRating, AVERAGE_RATING);
    });
  });

  describe("No Resilience scenario", () => {
    it("should reject with an error", async () => {
      fetchStub.rejects(new Error("Retry Error"));

      await assert.rejects(
        reviewsClient.getAverageRatingNoResilience("some-error@sap.com")
      );
    });

    it("should return the average rating for a contact in a successful scenario", async () => {
      const contact = "success-noresilience@sap.com";
      fetchStub
        .withArgs(`${CONFIG.endpoint}/api/v1/averageRatings/${contact}`)
        .resolves({
          status: 200,
          json: sandbox.stub().resolves({ averageRating: AVERAGE_RATING }),
        });
      const averageRating = await reviewsClient.getAverageRatingNoResilience(
        contact
      );

      assert.equal(averageRating, AVERAGE_RATING);
    });
  });
});
