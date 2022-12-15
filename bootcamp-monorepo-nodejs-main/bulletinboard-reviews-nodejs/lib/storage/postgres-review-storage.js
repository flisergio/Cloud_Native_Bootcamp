import util from 'util'
import IllegalArgumentError from '../error/illegal-argument-error.js'
import NotFoundError from '../error/not-found-error.js'

export default class PostgresReviewStorage {
  static EXISTS = 'SELECT EXISTS(SELECT 1 FROM reviews WHERE id=$1)'
  static CREATE = 'INSERT INTO reviews ("revieweeEmail", "reviewerEmail", rating, comment) VALUES ($1, $2, $3, $4) RETURNING id'
  static READ_ALL = 'SELECT id, "revieweeEmail", "reviewerEmail", rating, comment FROM reviews'
  static READ_ALL_FOR = 'SELECT id, "revieweeEmail", "reviewerEmail", rating, comment FROM reviews WHERE "revieweeEmail" = $1'
  static GET_AVERAGE_RATING_FOR = 'SELECT AVG(rating) AS "averageRating" FROM reviews WHERE "revieweeEmail" = $1'
  static DELETE_ALL = 'DELETE FROM reviews'

  #log = null
  #pool = null

  constructor (pool, logger) {
    this.#log = logger.child({ module: 'postgres-review-storage' })
    this.#pool = pool
  }

  async #checkId (id) {
    this.#log.debug('Checking id: %s', id)
    if (!id || typeof id !== 'number' || id < 1) {
      const message = util.format('Invalid id: %s', id)
      throw new IllegalArgumentError(message)
    }
    const { rows: [{ exists }] } = await this.#pool.query(PostgresReviewStorage.EXISTS, [id])
    if (!exists) {
      const message = util.format('No review found for id: %s', id)
      throw new NotFoundError(message)
    }
  }

  #checkReview ({ revieweeEmail, reviewerEmail, rating, comment }) {
    this.#log.debug('Checking review: %O', { revieweeEmail, reviewerEmail, rating, comment })
    if (!revieweeEmail || typeof revieweeEmail !== 'string' ||
      !reviewerEmail || typeof reviewerEmail !== 'string' ||
      typeof rating !== 'number' || rating < 0 ||
      !comment || typeof comment !== 'string'
    ) {
      const message = util.format('Invalid review: %O', { revieweeEmail, reviewerEmail, rating, comment })
      throw new IllegalArgumentError(message)
    }
  }

  async create ({ revieweeEmail = '', reviewerEmail = '', rating = 0, comment = '' } = {}) {
    try {
      this.#log.debug('Creating review: %O', { revieweeEmail, reviewerEmail, rating, comment })
      this.#checkReview({ revieweeEmail, reviewerEmail, rating, comment })
      const { rows: [{ id }] } = await this.#pool.query(PostgresReviewStorage.CREATE, [revieweeEmail, reviewerEmail, rating, comment])
      this.#log.debug('Successfully created review: %O - %d', { revieweeEmail, reviewerEmail, rating, comment }, id)
      return id
    } catch (error) {
      const { message } = error
      this.#log.error('Error creating review: %O - %s', { revieweeEmail, reviewerEmail, rating, comment }, message)
      throw error
    }
  }

  async readAll () {
    try {
      this.#log.debug('Reading all reviews')
      const { rows } = await this.#pool.query(PostgresReviewStorage.READ_ALL)
      this.#log.debug('Successfully read all reviews - %O', rows)
      return rows
    } catch (error) {
      const { message } = error
      this.#log.error('Error reading all reviews - %s', message)
      throw error
    }
  }

  async readAllFor (revieweeEmail) {
    try {
      this.#log.debug('Reading all reviews for %s', revieweeEmail)
      const { rows } = await this.#pool.query(PostgresReviewStorage.READ_ALL_FOR, [revieweeEmail])
      this.#log.debug('Successfully read all reviews for %s - %O', revieweeEmail, rows)
      return rows
    } catch (error) {
      const { message } = error
      this.#log.error('Error reading all reviews for %s - %s', revieweeEmail, message)
      throw error
    }
  }

  async getAverageRating (revieweeEmail) {
    try {
      this.#log.debug('Getting average rating for %s', revieweeEmail)
      const { rows: [{ averageRating }] } = await this.#pool.query(PostgresReviewStorage.GET_AVERAGE_RATING_FOR, [revieweeEmail])
      this.#log.debug('Successfully got average rating for %s - %d', revieweeEmail, averageRating)
      return { averageRating: parseFloat(averageRating) }
    } catch (error) {
      const { message } = error
      this.#log.error('Error getting average rating for %s - %s', revieweeEmail, message)
      throw error
    }
  }

  async deleteAll () {
    try {
      this.#log.debug('Deleting all reviews')
      await this.#pool.query(PostgresReviewStorage.DELETE_ALL)
      this.#log.debug('Successfully deleted all reviews')
    } catch ({ message }) {
      this.#log.error('Error deleting all reviews - %s', message)
      throw new Error(message)
    }
  }
}
