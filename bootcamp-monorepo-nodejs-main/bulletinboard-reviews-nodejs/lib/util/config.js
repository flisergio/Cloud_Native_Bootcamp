/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
const db =
  process.env.NODE_ENV === "test" ? "postgres" : "bulletinboard_reviews_dev";

export default {
  app: {
    port: 9090,
    maximumRequestsPossible: 10,
  },
  postgres: {
    connectionString: `postgresql://postgres:postgres@localhost:6543/${db}`,
  },
  rabbitmq: {
    connectionString: "amqp://localhost",
    queueName: "bulletinboard-queue",
  },
};

// Cloud Foundry

// import cfenv from 'cfenv'

// const appEnv = cfenv.getAppEnv({
//   vcapFile: 'vcap.json'
// })

// const { app: { port } } = appEnv

// const { uri: connectionString, sslcert: cert, sslrootcert: ca } = appEnv.getServiceCreds('bulletinboard-postgres')

// export default {
//   app: {
//     port
//   },
//   postgres: {
//     connectionString,
//     ssl: (cert && ca) ? { cert, ca } : false
//   }
// }

// Kubernetes

// const {
//   PORT: port = 9090,
//   POSTGRES_CONNECTION_STRING: connectionString =  `postgresql://postgres:postgres@localhost:6543/${db}`
// } = process.env

// export default {
//   app: {
//     port
//   },
//   postgres: {
//     connectionString
//   }
// }
