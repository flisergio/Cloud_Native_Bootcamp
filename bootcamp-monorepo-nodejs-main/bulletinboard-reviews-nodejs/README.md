[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Bulletinboard Reviews

## Prerequisites

- [**Git** client](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

- [**Node.js** LTS (>=16)](https://nodejs.org/en/download/)

  - If you need to manage multiple versions of `node` &/or `npm`, consider using a [Node Version Manager](https://github.com/npm/cli#node-version-managers) or running in a [development container](https://code.visualstudio.com/docs/remote/create-dev-container#_automate-dev-container-creation) using the [VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

- **IDE** of your choice

  - we recommend [Visual Studio Code](https://code.visualstudio.com/) with [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions

## Getting started

Please run:

1. `npm install`

    to install all required dependencies

1. `npm run db:start` (in a dedicated terminal)

    to start a local postgres instance

1. `npm start`

    to start the server

The **UI** will be availabe at [localhost:9090](http://localhost:9090).

The **API** can be accessed at

- [localhost:9090/api/v1/reviews](http://localhost:9090/api/v1/reviews)

- [localhost:9090/api/v1/averageRatings](http://localhost:9090/api/v1/averageRatings)

## Ad-Blocker
**If the UI does not load, please make sure your ad-blocker is not accidentially blocking parts of the application ;-)**


## Available Scripts

- `npm start`

    starts the server

- `npm test`

    runs the tests

- `npm run watch`

    starts and restarts the server on any code change

- `npm run lint`

    runs static code checks

- `npm run db:start`

    starts the postgres database

- `npm run db:prune`

    resets the db state (schema & data)

## Implementation Details

### JavaScript Standard Style

We are using [JavaScript Standard Style](https://standardjs.com).

Have a look at file `.eslintrc.json`.

### Database Migrations

We are using [db-migrate](https://github.com/db-migrate/node-db-migrate) (with [db-migrate-pg](https://github.com/db-migrate/pg)) for running database migrations, e.g. before starting the server.

Have a look at the `migrations` folder, file `lib/store/migrate.js`, and the `db:migrate:up` and `db:migrate:down` scripts in file `package.json`.

### Express Router

We are using an [express.Router](https://expressjs.com/en/4x/api.html#express.router) instance for encapsulating the reviews API.

Have a look at the

- `lib/router/ad-router.js`

- `lib/router/average-rating-router.js`

files.

### Sinon Stubs

We are using [Sinon Stubs](https://sinonjs.org/releases/latest/stubs/) for decoupling and test isolation.

Have a look at the `test` folder, e.g. file `test/storage/postgres-ad-storage.test.js`.

## Additional Features

### Running in a Development Container

If you are using [VS Code](https://code.visualstudio.com/) you can use the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension to open the project in a development container.

The container comes with

- [Node.js LTS 16](https://nodejs.org/en/download/),

- [cf CLI v8](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html),

- [kubectl](https://kubernetes.io/docs/reference/kubectl/overview/),

- and `Docker-in-Docker` support.

## How to Deploy

The project contains a **hybrid** configuration for deploying to both **Cloud Foundry** and **Kubernetes**.

Meaning some files are only relevant for one or the other.

The files `vcap.json` and `manifest.json` are only relevant for **Cloud Foundry** deployment.

Whereas `Dockerfile` and the `.k8s` directory are only relevant for **Kubernetes** deployment.

Also file `lib/util/config.js` needs to be adjusted for the deployment target.

### Cloud Foundry

1. Install the [cfenv](https://github.com/cloudfoundry-community/node-cfenv) module: `npm i cfenv`.

1. Enable the Cloud Foundry specific config in file `lib/util/config.js`.

1. Make sure to create a *Cloud Foundry (Trial) Account*.

1. Make sure to install the latest [cf CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html).

1. Use `cf api` to set your `API Endpoint`.

1. Use `cf login` to log in to your account (org and space).

1. Make sure to create a [postgres](https://help.sap.com/viewer/product/PostgreSQL/Cloud/en-US) service instance named `bulletinboard-postgres`.

1. Use `cf push` to deploy the application.

For a detailed guide please refer to [Cloud Foundry Basics (Node.js)](https://pages.github.tools.sap/cloud-curriculum/materials/cloud-platforms/cloud-foundry-nodejs/).

### Kubernetes

1. Enable the Kubernetes specific config in file `lib/util/config.js`.

1. Use `docker login` to login your *Docker Registry*.

    `docker login -u "claude" -p "9qR5hbhm7Dzw6BNZcRFv" cc-ms-k8s-training.common.repositories.cloud.sap`

1. Use `docker build` to build the Docker image.

    `docker build -t cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-reviews-<your D/C/I number> .`

1. Use `docker push` to push the built image to the registry.

    `docker push cc-ms-k8s-training.common.repositories.cloud.sap/bulletinboard-reviews-<your D/C/I number>`

1. Create a Kubernetes Cluster.

    E.g. with [Gardener](https://dashboard.garden.canary.k8s.ondemand.com/login) and make sure to enable `Nginx Ingress`.

1. Copy and import the `Kubeconfig` for your Kubernetes Cluster.

    If you are using [VS Code](https://code.visualstudio.com/) you can copy the config to file `.k8s/kubeconfig.yml`.

    In `.vscode/settings.json` we are setting the `KUBECONFIG` environment variable to point to the `.k8s/kubeconfig.yml` file for the integrated terminal.

1. Run `kubectl cluster-info` to ensure you can connect to the cluster.

1. Replace the `<your D/C/I number>` placeholders in file `.k8s/bulletinboard-reviews.yml`.

1. Replace the `<CLUSTER>.<PROJECT>` placeholders in file `.k8s/bulletinboard-reviews.yml`.

1. Run `kubectl apply -f ./.k8s/1_docker-registry.yml`.

1. Run `kubectl apply -f ./.k8s/2_bulletinboard-reviews-db.yml`.

1. Run `kubectl apply -f ./.k8s/3_bulletinboard-reviews.yml`.

For a detailed guide please refer to [Kubernetes Basics (Node.js)](https://pages.github.tools.sap/cloud-curriculum/materials/cloud-platforms/kubernetes-nodejs/).
