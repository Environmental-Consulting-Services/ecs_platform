# ECSD Storm Water Management Platform

ECSD is a multi-service platform with a web console, backend APIs, supporting services, mobile clients, and a GCP infrastructure project.

## Prerequisites

Core tools used in this repo:

- Docker
- Node.js 18 for the application services
- `gcloud` CLI for GCP operations
- Pulumi for infrastructure work in `ecsd_infra`

This repository includes an `.nvmrc` file. If you use `nvm`:

```bash
nvm install
nvm use
node --version
```

Install details and environment setup are split by topic:

- Docker and local stack setup: [docs/docker.md](docs/docker.md)
- Infrastructure project workflow: [ecsd_infra/README.md](ecsd_infra/README.md)

## Docs

- [docs/architecture.md](docs/architecture.md): platform inventory, topology, and service communication
- [docs/docker.md](docs/docker.md): local Docker usage, local stack setup, image builds, and image pushes
- [docs/deployment.md](docs/deployment.md): production deployment model, app/infra update flow, and planned infra follow-ups
- [ecsd_infra/README.md](ecsd_infra/README.md): infra-project structure, workflow, and validation

## Quick Start

The recommended local loop is:

1. Start MongoDB in Docker.
2. Run `ecsd_api`, `ecsd_console`, and `ecsd_expert` locally with Node.
3. Seed local data and sign in with the seeded admin account.

Use [docs/docker.md](docs/docker.md) for the full commands and environment setup.

Typical local service URLs:

```text
Console: http://localhost:3000
API:     http://localhost:8080
Expert:  http://localhost:8081
MongoDB: mongodb://localhost:27017
```

## Repo Areas

- `ecsd_console`: web console
- `ecsd_api`: primary backend API
- `ecsd_expert`: expert/chat backend
- `ecsd_mail`: transactional mail service
- `ecsd_scheduler`: background job runner
- `ecsd_proxy`: legacy reverse-proxy container
- `ecsd_docker`: legacy compose deployment assets
- `ecsd_mobile`: mobile app
- `ecsd_forms`: forms module
- `ecsd_infra`: Pulumi infrastructure project
