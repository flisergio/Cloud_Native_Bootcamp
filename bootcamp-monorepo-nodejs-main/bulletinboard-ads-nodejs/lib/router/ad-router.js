/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import express from "express";

export default (storage, reviewsClient, logger) => {
  const parseId = () => (req, res, next) => {
    if (req.params.id) {
      req.params.id = parseInt(req.params.id);
    }
    next();
  };

  const getAverageContactRating = async ({ contact }) => {
    const averageContactRating = await storage.readAvgRatingFor(contact);
    return averageContactRating;
  };

  const getReviewsUrl = ({ contact }) => {
    return `${reviewsClient.getEndpoint()}/#/reviews/${contact}`;
  };

  const getTransientProps = async (ad) => {
    return {
      averageContactRating: await getAverageContactRating(ad),
      reviewsUrl: getReviewsUrl(ad),
    };
  };

  const router = express.Router();

  router.post("/", express.json(), async (req, res, next) => {
    const { body } = req;
    try {
      const id = await storage.create(body);
      res
        .status(201)
        .location(`/api/v1/ads/${id}`)
        .json({
          id,
          ...body,
          ...(await getTransientProps(body)),
        });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      let ads = await storage.readAll();
      ads = await Promise.all(
        ads.map(async (ad) => {
          return {
            ...ad,
            ...(await getTransientProps(ad)),
          };
        })
      );
      res.status(200).json(ads);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", parseId(), async (req, res, next) => {
    try {
      const {
        params: { id },
      } = req;
      let ad = await storage.read(id);
      ad = {
        ...ad,
        ...(await getTransientProps(ad)),
      };
      res.status(200).json(ad);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", express.json(), parseId(), async (req, res, next) => {
    try {
      const {
        params: { id },
        body,
      } = req;
      await storage.update(id, body);
      res.status(200).json();
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

  router.delete("/:id", parseId(), async (req, res, next) => {
    try {
      const {
        params: { id },
        body,
      } = req;
      await storage.delete(id, body);
      res.status(200).json();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
