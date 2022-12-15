/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import fetch from "node-fetch";
import config from "./lib/util/config.js";
import Pool from "./lib/storage/pool.js";
import PostgresAdStorage from "./lib/storage/postgres-ad-storage.js";
import ReviewsClient from "./lib/client/reviews-client.js";
import logger from "./lib/util/logger.js";
import application from "./lib/application.js";
import RabbitMQClient from "./lib/mq/rabbitmq-client.js";

const {
  app: { port },
  postgres,
  reviews,
  rabbitmq,
} = config;

const log = logger.child({ module: "server" });

const pool = new Pool(postgres);
const storage = new PostgresAdStorage(pool, logger);
const reviewsClient = new ReviewsClient(reviews, fetch, logger);
const app = application(storage, reviewsClient, logger);
const MQClient = new RabbitMQClient(rabbitmq, logger);

MQClient.receiveAverageRating(async function (contact, avgRating) {
  await storage.writeAvgRatingFor(contact, avgRating);
});

const server = app
  .listen(port, () =>
    log.info("Server is listening on http://localhost:%d", port)
  )
  .on("error", ({ message }) =>
    log.error("Error starting server: %s", message)
  );

const shutdown = () => {
  log.info("Shutting down ads gracefully");
  MQClient.close();
  server.close();
  pool.end();
};

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
