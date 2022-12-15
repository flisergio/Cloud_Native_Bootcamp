import assert from 'assert/strict'
import util from 'util'
import sinon from 'sinon'
import config from '../../lib/util/config.js'
import logger from '../../lib/util/logger.js'
import Pool from '../../lib/storage/pool.js'
import PostgresReviewStorage from '../../lib/storage/postgres-review-storage.js'
import IllegalArgumentError from '../../lib/error/illegal-argument-error.js'
import { FIRST_REVIEW, SECOND_REVIEW } from '../reviews.js'

describe('postgres-review-storage', () => {
  const sandbox = sinon.createSandbox()

  let loggerStub = null
  let pool = null
  let storage = null

  before(() => {
    const { postgres } = config
    pool = new Pool(postgres)
  })

  beforeEach(() => {
    loggerStub = sandbox.stub(logger)
    loggerStub.child.returnsThis()
    storage = new PostgresReviewStorage(pool, loggerStub)
  })

  afterEach(async () => {
    await storage.deleteAll()
    sandbox.restore()
  })

  after(async () => {
    await pool.end()
  })

  describe('create', () => {
    it('should reject with an error when creating an invalid review', async () => {
      for (const key of Object.keys(FIRST_REVIEW)) {
        const invalid = {
          [key]: null
        }
        const invalidReview = {
          ...FIRST_REVIEW,
          ...invalid
        }
        const message = util.format('Invalid review: %O', invalidReview)
        const error = new IllegalArgumentError(message)
        await assert.rejects(storage.create(invalidReview), error)
      }
    })

    it('should create a review', async () => {
      const id = await storage.create(FIRST_REVIEW)
      const ads = await storage.readAll()
      assert.equal(ads.length, 1)
      assert.deepEqual(ads, [{
        id,
        ...FIRST_REVIEW
      }])
    })
  })

  describe('readAll', () => {
    it('should read all reviews', async () => {
      const firstId = await storage.create(FIRST_REVIEW)
      const secondId = await storage.create(SECOND_REVIEW)
      const reviews = await storage.readAll()
      assert.equal(reviews.length, 2)
      assert.deepEqual(reviews, [
        {
          id: firstId,
          ...FIRST_REVIEW
        },
        {
          id: secondId,
          ...SECOND_REVIEW
        }
      ])
    })
  })

  describe('readAllFor', () => {
    it('should read all reviews', async () => {
      const { revieweeEmail } = FIRST_REVIEW
      const id = await storage.create(FIRST_REVIEW)
      const reviews = await storage.readAllFor(revieweeEmail)
      assert.equal(reviews.length, 1)
      assert.deepEqual(reviews, [
        {
          id,
          ...FIRST_REVIEW
        }
      ])
    })
  })

  describe('getAverageRating', () => {
    it('should get the average rating', async () => {
      const { rating, revieweeEmail } = SECOND_REVIEW
      await Promise.all([
        storage.create(SECOND_REVIEW),
        storage.create(SECOND_REVIEW),
        storage.create(SECOND_REVIEW)
      ])
      const { averageRating: actualAverageRating } = await storage.getAverageRating(revieweeEmail)
      assert.equal(actualAverageRating, rating)
    })
  })

  describe('deleteAll', () => {
    it('should delete all reviews', async () => {
      await Promise.all([
        storage.create(SECOND_REVIEW),
        storage.create(SECOND_REVIEW),
        storage.create(SECOND_REVIEW)
      ])
      await storage.deleteAll()
      const reviews = await storage.readAll()
      assert.equal(reviews.length, 0)
      assert.deepEqual(reviews, [])
    })
  })
})
