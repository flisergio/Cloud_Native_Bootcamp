/* eslint-disable curly */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable indent */
/* eslint-disable import/no-duplicates */
/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import CircuitBreaker from "opossum";

export default class ReviewsClient {
  #config = null;
  #log = null;
  #fetchFunction = null;
  #circuitBreaker = null;

  constructor(config, fetch, logger) {
    this.#config = config;
    this.#log = logger.child({ module: "reviews-client" });

    const fetchFunction = async (contact) => {
      const response = await fetch(
        `${config.endpoint}/api/v1/averageRatings/${contact}`
      );

      if (response.status === 200) {
        const { averageRating } = await response.json();
        return averageRating;
      } else
        return Promise.reject("Got some unexpected (not 200) response status.");
    };

    this.#fetchFunction = fetchFunction;
    this.#circuitBreaker = new CircuitBreaker(fetchFunction, {
      timeout: config.fallback.timeout,
    });
  }

  getEndpoint() {
    return this.#config.endpoint;
  }

  async getAverageRating(contact) {
    this.#log.debug(`Getting average rating for ${contact}`);

    return this.#config.resilience === "fallback"
      ? this.getAverageRatingFallback(contact)
      : this.#config.resilience === "retry"
      ? this.getAverageRatingRetry(contact)
      : this.getAverageRatingNoResilience(contact);
  }

  async getAverageRatingFallback(contact) {
    try {
      const averageRating = await this.#circuitBreaker.fire(contact);
      this.#log.debug(
        `Successfully got an average rating for ${contact}: ${averageRating}.`
      );

      return averageRating;
    } catch (error) {
      this.#log.debug(
        `getAverageRatingFallback failed: ${
          error.message
        }. Returning default average rating: ${
          this.#config.fallback.defaultAverageRating
        }`
      );

      return this.#config.fallback.defaultAverageRating;
    }
  }

  async getAverageRatingRetry(contact) {
    for (let attempt = 1; attempt <= this.#config.retry.attempts; attempt++) {
      if (attempt > 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.#config.retry.interval)
        );
      }

      try {
        const averageRating = await this.#fetchFunction(contact);
        this.#log.debug(
          `Successfully got an average rating for ${contact}: ${averageRating}.`
        );

        return averageRating;
      } catch (error) {
        this.#log.debug(`getAverageRatingRetry failed: ${error.message}.`);
      }
    }

    return Promise.reject(
      `getAverageRatingRetry failed after ${
        this.#config.retry.attempts
      } attempts.`
    );
  }

  async getAverageRatingNoResilience(contact) {
    try {
      const averageRating = await this.#fetchFunction(contact);
      this.#log.debug(
        `Successfully got an average rating for ${contact}: ${averageRating}.`
      );

      return averageRating;
    } catch (error) {
      this.#log.debug(`getAverageRatingNoResilience failed: ${error.message}`);

      return Promise.reject(error);
    }
  }
}
