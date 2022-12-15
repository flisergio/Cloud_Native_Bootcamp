/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
import assert from "assert/strict";
import { STATUS_CODES } from "http";
import sinon from "sinon";
import supertest from "supertest";
import { readFile } from "fs/promises";
import { join } from "path";
import logger from "../lib/util/logger.js";
import PostgresReviewStorage from "../lib/storage/postgres-review-storage.js";
import application from "../lib/application.js";
import RabbitMQClient from "../lib/mq/rabbitmq-client.js";

describe("application", () => {
  const sandbox = sinon.createSandbox();

  let loggerStub = null;
  let storageStub = null;
  let MQClientStub = null;
  let client = null;

  const maximumRequestsPossible = 30;

  beforeEach(() => {
    loggerStub = sandbox.stub(logger);
    loggerStub.child.returnsThis();
    storageStub = sandbox.createStubInstance(PostgresReviewStorage);
    MQClientStub = sandbox.createStubInstance(RabbitMQClient);
    const app = application(storageStub, MQClientStub, loggerStub, maximumRequestsPossible);
    client = supertest(app);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("get /public", () => {
    it("should serve the ui", async () => {
      const { text } = await client
        .get("/")
        .expect(200)
        .expect("Content-Type", /text\/html/);
      const path = join(process.cwd(), "public", "index.html");
      const index = await readFile(path, "utf8");
      assert.equal(text, index);
    });
  });

  describe("get /health", () => {
    it("should be ok", async () => {
      const { text } = await client
        .get("/health")
        .expect(200)
        .expect("Content-Type", /text\/plain/);
      assert.equal(text, "OK");
    });
  });

  describe("any /*", () => {
    it("should not be implemented", async () => {
      const methods = ["get", "post", "put", "delete"];
      for (const method of methods) {
        const code = 501;
        const { text } = await client[method]("/not/implemented")
          .expect(code)
          .expect("Content-Type", /text\/plain/);
        assert.equal(text, STATUS_CODES[code]);
      }
    });
  });
});
