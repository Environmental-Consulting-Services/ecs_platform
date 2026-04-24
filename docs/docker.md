# Docker

This document covers Docker usage in this repo:

- local MongoDB for development
- the legacy compose stack
- manual image builds
- image push workflows

## Local Development Stack

The recommended local workflow is hybrid, not full compose:

- MongoDB runs in Docker on `localhost:27017`
- `ecsd_api` runs locally on `http://localhost:8080`
- `ecsd_console` runs locally on `http://localhost:3000`
- `ecsd_expert` runs locally on `http://localhost:8081`

### Prerequisites

- Docker
- Node 18 via `.nvmrc`
- npm

If you use `nvm`:

```bash
nvm install
nvm use
node --version
```

### Start MongoDB

Create the local MongoDB container once:

```bash
docker run -d --name ecs-mongo -p 27017:27017 mongo:6
```

Start it on later runs:

```bash
docker start ecs-mongo
```

### Local Environment Files

Create `ecsd_api/.env.dev` and `ecsd_api/.env-dev` with:

```env
ENV_NAME=local
PORT=8080
DATABASE_URL=mongodb://localhost:27017/ecsd?
FILES_DB_URL=mongodb://localhost:27017/ecsd_files?
FILES_DB=ecsd_files
IMG_BUCKET=images
JWT_SECRET=token
APP_URL_CLIENT=http://localhost:3000
APP_URL_API=http://localhost:8080
MAIL_API_URL=http://localhost:8083
MAIL_API_HOST=localhost
MAIL_API_PORT=8083
MAILTRAP_USER=
MAILTRAP_PASSWORD=
```

Create `ecsd_expert/.env.dev`, `ecsd_expert/.env-dev`, and `ecsd_expert/.env` with:

```env
ENV_NAME=local
PORT=8081
CHAT_DATABASE_URL=mongodb://localhost:27017/ecsd_chat?
JWT_SECRET=token
APP_URL_CLIENT=http://localhost:3000
APP_URL_API=http://localhost:8081
OPENAI_API_KEY=
OPEN_AI_API_KEY=
OPEN_AI_ASSISTANT_ID=
```

Make sure `ecsd_console/public/runtime-env.js` points at local services:

```js
window._env_ = {
  REACT_APP_API_URL: "http://localhost:8080",
  REACT_APP_URL: "http://localhost:3000",
  REACT_APP_IMAGES: "http://localhost:8080",
  REACT_APP_IS_DEMO: "",
};
```

### Install Dependencies

```bash
cd ecsd_api && npm install
cd ../ecsd_console && npm ci --legacy-peer-deps
cd ../ecsd_expert && npm install
```

### Seed Local Data

Seed the API database:

```bash
cd ecsd_api
NODE_ENV=dev ./node_modules/.bin/babel-node --experimental-specifier-resolution=node src/mongoose/seedData.js
```

Seeded login:

```text
admin@ecscompliance.com
secret
```

### Start Services

Run each service in its own terminal.

API:

```bash
cd ecsd_api
npm run start:dev
```

Console:

```bash
cd ecsd_console
BROWSER=none PORT=3000 npm start
```

Expert:

```bash
cd ecsd_expert
npm run start:dev
```

Service URLs:

```text
Console: http://localhost:3000
API:     http://localhost:8080
Expert:  http://localhost:8081
MongoDB: mongodb://localhost:27017
```

### Optional: Restore Handoff Data

The sibling `../ecs_data` repository stores MongoDB backups with Git LFS.

```bash
cd ../ecs_data
git lfs pull
```

Then restore with MongoDB tools:

```bash
tar -xvzf db_backup/ECSD-Cluster-0-2025-01-15T18-47-59.142Z.tgz
mongorestore --db ecsd path/to/extracted_folder
```

## Legacy Compose Stack

`ecsd_docker/compose.yml` describes the older containerized stack:

- `nginx`
- `api`
- `console`
- `mail`
- `expert`
- `certbot`

It expects:

- environment files under `ecsd_docker/env/<env>/`
- certificates under `ecsd_docker/certbot/`
- images published under `ghcr.io/llamalogic/*`

That makes it unsuitable as the default fresh-checkout developer path.

If you already have those dependencies in place:

```bash
cd ecsd_docker
APP_ENV=dev APP_DOMAIN=app.ecscompliance.com docker compose -f compose.yml up -d
```

## Build Images

### Legacy Manual Builds

Build individual service images from the repo root.

```bash
docker build . -t ghcr.io/llamalogic/api -f ./ecsd_api/docker/Dockerfile
docker build . -t ghcr.io/llamalogic/console -f ./ecsd_console/docker/Dockerfile
docker build . -t ghcr.io/llamalogic/expert -f ./ecsd_expert/docker/Dockerfile
docker build . -t ghcr.io/llamalogic/mail -f ./ecsd_mail/docker/Dockerfile
docker build . -t ghcr.io/llamalogic/nginx -f ./ecsd_proxy/docker/Dockerfile
docker build . -t ghcr.io/llamalogic/scheduler -f ./ecsd_scheduler/Dockerfile
```

### Current GCP Image Build And Push

The current production-oriented image workflow is driven by `ecsd_infra/scripts/build-and-push-images.sh`:

```bash
cd ecsd_infra
npm run images:push
```

By default this builds and pushes:

- `console`
- `api`
- `expert`
- `mail`
- `scheduler`

to:

```text
us-central1-docker.pkg.dev/smartcomplai/ecsd/<service>
```

Useful overrides:

```bash
SHA_TAG="$(git rev-parse --short HEAD)" npm run images:push
ALIAS_TAG= npm run images:push
PLATFORM=linux/amd64 npm run images:push api console
```

## Push Images

### Legacy GHCR Pushes

```bash
docker login ghcr.io -u <username>
docker push ghcr.io/llamalogic/api
docker push ghcr.io/llamalogic/console
docker push ghcr.io/llamalogic/expert
docker push ghcr.io/llamalogic/mail
docker push ghcr.io/llamalogic/nginx
docker push ghcr.io/llamalogic/scheduler
```

### Artifact Registry Push Prerequisites

For the current GCP flow:

- Docker with Buildx support
- `gcloud` authenticated to the target project
- Docker configured for Artifact Registry

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## Pull And Run Legacy Images

These commands are for the older containerized topology, not the recommended local developer loop.

```bash
docker pull ghcr.io/llamalogic/api:latest
docker pull ghcr.io/llamalogic/console:latest
docker pull ghcr.io/llamalogic/expert:latest
docker pull ghcr.io/llamalogic/mail:latest
docker pull ghcr.io/llamalogic/nginx:latest
```

```bash
docker run -d --name api --hostname api --network ecsd-app --env-file ./.env-api -p 8080:8080 ghcr.io/llamalogic/api
docker run -d --name console --hostname console --network ecsd-app --env-file ./.env-app -p 8081:80 ghcr.io/llamalogic/console:latest
docker run -d --name nginx --hostname nginx --network ecsd-app -p 80:80 ghcr.io/llamalogic/nginx
docker run -d --name expert --hostname expert --network ecsd-app --env-file ./.env-expert -p 8082:8082 ghcr.io/llamalogic/expert
```
