/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
const db =
  process.env.NODE_ENV === "test" ? "postgres" : "bulletinboard_ads_dev";

export default {
  app: {
    port: 8080,
  },
  postgres: {
    connectionString: `postgresql://postgres:postgres@localhost:5432/${db}`,
  },
  reviews: {
    endpoint: "http://localhost:9090",
    resilience: null,
    fallback: {
      timeout: 5000,
      defaultAverageRating: 1.0,
    },
    retry: {
      attempts: 5,
      interval: 5000,
    },
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

// const { REVIEWS_ENDPOINT: endpoint = 'http://localhost:9090' } = process.env

// export default {
//   app: {
//     port
//   },
//   postgres: {
//     connectionString,
//     ssl: (cert && ca) ? { cert, ca } : false
//   },
//   reviews: {
//     endpoint
//   }
// }

// Kubernetes

// const {
//   PORT: port = 3000,
//   POSTGRES_CONNECTION_STRING: connectionString = `postgresql://postgres:postgres@localhost:5432/${db}`,
//   REVIEWS_ENDPOINT: endpoint = 'http://localhost:9090'
// } = process.env

// export default {
//   app: {
//     port
//   },
//   postgres: {
//     connectionString
//   },
//   reviews: {
//     endpoint
//   }
// }
