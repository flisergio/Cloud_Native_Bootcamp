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
  #consumerTag = null;

  constructor(config, logger) {
    this.#connectionString = config.connectionString;
    this.#queueName = config.queueName;
    this.#log = logger.child({ module: "rabbitmq-client" });
    this.#init = false;
  }

  async receiveAverageRating(callback) {
    if (!this.#init) {
      this.#init = true;
      this.#connection = await client.connect(this.#connectionString);
      this.#channel = await this.#connection.createChannel();
      await this.#channel.assertQueue(this.#queueName);

      const consume = await this.#channel.consume(this.#queueName, (msg) => {
        if (msg) {
          const payload = JSON.parse(msg.content.toString());
          this.#log.info(`Received a message ${payload}`);

          callback(payload.contact, payload.avgRating);
          this.#channel.ack(msg);
        }
      });
      this.#consumerTag = consume.consumerTag;
    }
  }

  async close() {
    const channel = this.#channel,
      conn = this.#connection;

    if (this.#init) {
      await channel.cancel(this.#consumerTag);
      await channel.close();
      await conn.close();
    }
  }
}
