/* eslint-disable one-var */
/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import client from "amqplib";

export default class RabbitMQClient {
  #init = false;
  #connectionString = null;
  #queueName = null;
  #log = null;
  #connection = null;
  #channel = null;

  constructor(config, logger) {
    this.#connectionString = config.connectionString;
    this.#queueName = config.queueName;
    this.#log = logger.child({ module: "rabbitmq-client" });
    this.#init = false;
  }

  async sendAverageRatingFor(contact, avgRating) {
    if (!this.#init) {
      this.#init = true;
      this.#connection = await client.connect(this.#connectionString);
      this.#channel = await this.#connection.createChannel();
      await this.#channel.assertQueue(this.#queueName);
    }

    const payload = {
      contact,
      avgRating,
    };

    this.#log.info(`Sending a message ${payload}`);
    this.#channel.sendToQueue(
      this.#queueName,
      Buffer.from(JSON.stringify(payload))
    );
  }

  async close() {
    const channel = this.#channel,
      conn = this.#connection;

    if (this.#init) {
      channel.close();
      conn.close();
    }
  }
}
