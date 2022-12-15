/* eslint-disable curly */
/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import express from "express";
import rateLimit from "express-rate-limit";

export default (storage, maximumRequestsPossible) => {
  const router = express.Router();
  const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: maximumRequestsPossible,
  });

  router.get("/:revieweeEmail", rateLimiter, async (req, res, next) => {
    try {
      const {
        params: { revieweeEmail },
      } = req;
      const result = await storage.getAverageRating(revieweeEmail);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
