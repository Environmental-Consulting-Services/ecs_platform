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

### gcloud CLI

Run:

```bash
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh
```

### Pulumi

Used to deploy the infrastructure to GCP.

Run:

```bash
curl -fsSL https://get.pulumi.com | sh -s -- --version 3.231.0
```

## Documentation

The detailed operational and topology docs are now split by scope:

- [docs/docker.md](docs/docker.md): Docker usage, local stack setup, image builds, and image pushes
- [docs/deployment.md](docs/deployment.md): production deployment flow and infra follow-up work
- [docs/architecture.md](docs/architecture.md): platform inventory, topology, and communication paths
- [ecsd_infra/README.md](ecsd_infra/README.md): Pulumi project workflow and infra-specific commands
