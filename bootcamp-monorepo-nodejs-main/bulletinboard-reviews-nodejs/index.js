/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import config from "./lib/util/config.js";
import logger from "./lib/util/logger.js";
import Pool from "./lib/storage/pool.js";
import PostgresReviewStorage from "./lib/storage/postgres-review-storage.js";
import application from "./lib/application.js";
import RabbitMQClient from "./lib/mq/rabbitmq-client.js";

const {
  app: { port, maximumRequestsPossible },
  postgres,
  rabbitmq,
} = config;

const log = logger.child({ module: "server" });

const pool = new Pool(postgres);
const storage = new PostgresReviewStorage(pool, logger);
const MQClient = new RabbitMQClient(rabbitmq, logger);
const app = application(storage, MQClient, logger, maximumRequestsPossible);

const server = app
  .listen(port, () =>
    log.info("Server is listening on http://localhost:%d", port)
  )
  .on("error", ({ message }) =>
    log.error("Error starting server: %s", message)
  );

const shutdown = () => {
  log.info("Shutting down reviews gracefully");
  MQClient.close();
  server.close();
  pool.end();
};

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
