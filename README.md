# ECSD Storm Water Management Platform

## Installation

Dependencies:

- Docker 29.1.2
- Ubuntu 20.04 LTS

### nvm

Run:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

### NodeJS

**Dependencies:**

- nvm

From inside the project root directory, run:

```bash
nvm install
```

### Autoenv

Installing autoenv eliminates the need to run `nvm use` every time you `cd`
into the project.

**Dependencies:**

- nvm

Run:

```bash
nvm use node
```

```bash
curl -#fLo- 'https://raw.githubusercontent.com/hyperupcall/autoenv/master/scripts/install.sh' | sh
```

The above command will append a line to your `~/.bashrc` file that sources
`autoenv/activate.sh`. Add the following variables to your `~/.bashrc` file
immediately _before_ the source line:

```bash
AUTOENV_ENABLE_LEAVE=yes
AUTOENV_ENV_FILENAME=.autoenv
AUTOENV_ENV_LEAVE_FILENAME=.autoenv.leave
```

## Docker Build and Deploy

Prereqs:

- docker (if you want to build and deploy)
- docker login ghcr.io -u <username> (will requiore a person access token from github)

Initial Setup:\
\

```
npm install\
```

\
\
Build ECSD:\
\

```
docker build . -t ghcr.io/llamalogic/api -f ./api/Dockerfile\
```

```
docker build . -t ghcr.io/llamalogic/console -f ./console/docker/Dockerfile\
```

```
docker build . -t ghcr.io/llamalogic/nginx -f ./nginx/Dockerfile\
```

```
docker build . -t ghcr.io/llamalogic/expert -f ./expert/Dockerfile\
```

\
\
Publish ECSD:\
\

```
docker push ghcr.io/llamalogic/api\
```

```
docker push ghcr.io/llamalogic/console\
```

```
docker push ghcr.io/llamalogic/nginx\
```

```
docker push ghcr.io/llamalogic/expert\
```

\
\
Get ECSD\
\

```
docker pull ghcr.io/llamalogic/api:latest\
```

```
docker pull ghcr.io/llamalogic/console:latest\
```

```
docker pull ghcr.io/llamalogic/nginx:latest\
```

```
docker pull ghcr.io/llamalogic/expert:latest\
```

\
\
Run ECSD: \
\

```
docker run -d --name api --hostname api --network ecsd-app --env-file ./.env-api  -p 8080:8080 -t ghcr.io/llamalogic/api\
```

```
docker run -d --name console --hostname console --network ecsd-app --env-file ./.env-app  -p 8081:80 -t ghcr.io/llamalogic/console:latest\
```

```
docker run -d -t -p 80:80 --name nginx --hostname nginx --network ecsd-app ghcr.io/llamalogic/nginx\
```

```
docker run -d --name expert --hostname expert --network ecsd-app --env-file ./.env-expert  -p 8082:8082 -t ghcr.io/llamalogic/expert\
```

## Local development setup

The fastest local setup is a hybrid run:

- MongoDB runs in Docker.
- API, console, and expert/chat services run with local Node.js.

The full Docker Compose setup in `ecsd_docker/compose.yml` is intended for the deployed stack and expects environment files, certificates, and GHCR images that are not included in a fresh checkout.

### Prerequisites

- Docker
- Node.js 18
- npm

This repository includes an `.nvmrc` file for Node 18. If you use nvm, run this from the repository root before installing dependencies:

```bash
nvm use
node --version
```

### Start MongoDB

Create the local MongoDB container once:

```bash
docker run -d --name ecs-mongo -p 27017:27017 mongo:6
```

On later runs, start the existing container:

```bash
docker start ecs-mongo
```

### Local environment files

Create `ecsd_api/.env.dev` and `ecsd_api/.env-dev` with the same contents:

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

Create `ecsd_expert/.env.dev`, `ecsd_expert/.env-dev`, and `ecsd_expert/.env` with the same contents:

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

Make sure `ecsd_console/public/runtime-env.js` includes the local API URLs:

```js
window._env_ = {
  REACT_APP_API_URL: "http://localhost:8080",
  REACT_APP_URL: "http://localhost:3000",
  REACT_APP_IMAGES: "http://localhost:8080",
  REACT_APP_IS_DEMO: "",
};
```

`JWT_SECRET=token` is required because the current login route signs JWTs with the literal secret `token`.

### Install dependencies

From the repository root:

```bash
cd ecsd_api
npm install
```

```bash
cd ../ecsd_console
npm ci --legacy-peer-deps
```

```bash
cd ../ecsd_expert
npm install
```

### Seed the local database

Run the API seed file through Babel. The package script currently uses plain `node`, which does not load the ES module source correctly.

```bash
cd ecsd_api
NODE_ENV=dev ./node_modules/.bin/babel-node --experimental-specifier-resolution=node src/mongoose/seedData.js
```

Seeded login:

```text
admin@ecscompliance.com
secret
```

The `/account-settings` console page is legacy Material Dashboard template UI and is not wired to the logged-in user. It hardcodes the displayed `Alex Thompson` profile in `ecsd_console/src/layouts/pages/account/settings/components/Header/index.js` and uses placeholder data in the account settings forms. `/user-profile` is intended to be the API-backed profile page that reads and updates the seeded/admin user through the `me` endpoint, but it currently renders a blank screen and needs debugging before it can be used.

### Start the services

Start each service in a separate terminal.

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

Expert/chat service:

```bash
cd ecsd_expert
npm run start:dev
```

Open the console at:

```text
http://localhost:3000
```

Service URLs:

```text
Console: http://localhost:3000
API:     http://localhost:8080
Expert:  http://localhost:8081
MongoDB: mongodb://localhost:27017
```

### Optional: restore handoff data

The sibling `../ecs_data` repository stores MongoDB backups with Git LFS. If the backup file is only a small text pointer, install/fix Git LFS and pull the real archive:

```bash
cd ../ecs_data
git lfs pull
```

Then extract and restore the archive with MongoDB tools:

```bash
tar -xvzf db_backup/ECSD-Cluster-0-2025-01-15T18-47-59.142Z.tgz
mongorestore --db ecsd path/to/extracted_folder
```

The exact database name must match the API `DATABASE_URL`.
