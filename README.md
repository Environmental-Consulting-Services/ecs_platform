# ECSD Storm Water Management Platform

ECSD is a multi-service platform with a web console, backend APIs, supporting services, mobile clients, and a GCP infrastructure project.

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

Use [docs/docker.md](docs/docker.md) for the actual commands and environment setup.

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
