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
