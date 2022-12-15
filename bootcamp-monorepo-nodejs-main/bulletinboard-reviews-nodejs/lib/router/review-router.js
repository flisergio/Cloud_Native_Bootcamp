/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import express from "express";

export default (storage, MQClient, logger) => {
  const router = express.Router();

  router.post("/", express.json(), async (req, res, next) => {
    const { body } = req;
    try {
      const id = await storage.create(body);
      const averageRating = await storage.getAverageRating(
        body.revieweeEmail
      );
      MQClient.sendAverageRatingFor(
        body.revieweeEmail,
        averageRating.averageRating
      );
      res
        .status(201)
        .location(`/api/v1/reviews/${id}`)
        .json({
          id,
          ...body,
        });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      const reviews = await storage.readAll();
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:revieweeEmail", async (req, res, next) => {
    try {
      const {
        params: { revieweeEmail },
      } = req;
      const reviews = await storage.readAllFor(revieweeEmail);
      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/", async (req, res, next) => {
    try {
      await storage.deleteAll();
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
