# Architecture

This document describes the platform structure at the service level: what exists, how the pieces fit together, and how they communicate.

## Platform Inventory

- `ecsd_console`: React web console for browser users
- `ecsd_api`: primary application API and business logic
- `ecsd_expert`: expert/chat backend and OpenAI-facing service
- `ecsd_mail`: mail delivery service
- `ecsd_scheduler`: background job runner
- `ecsd_proxy`: legacy reverse proxy for the old containerized stack
- `ecsd_mobile`: mobile client
- `ecsd_forms`: forms module used by the mobile app
- `ecsd_docker`: legacy compose deployment assets
- `ecsd_infra`: Pulumi infrastructure project

## Topology

There are two useful ways to think about the platform.

### Local Development Topology

- Browser -> `ecsd_console`
- `ecsd_console` -> `ecsd_api`
- `ecsd_console` -> `ecsd_expert` where chat/expert features require it
- `ecsd_api` -> MongoDB
- `ecsd_api` -> `ecsd_mail`
- `ecsd_expert` -> MongoDB
- `ecsd_expert` -> OpenAI

In the recommended local setup:

- MongoDB runs in Docker
- API, console, and expert run locally with Node

### Deployed Topology

At a high level, production is:

- one public web entrypoint
- multiple service containers behind it
- MongoDB as the primary data store
- external integrations for AI and email

The exact GCP resource graph belongs in `ecsd_infra`, not in this document.

## Communication

### User-Facing Paths

- Browser users load the web console
- The console calls API endpoints for application data
- The console calls expert/chat endpoints for expert features
- Mobile clients call backend services through their configured endpoints

### Service-To-Service Paths

- `ecsd_api` calls `ecsd_mail` for outbound mail workflows
- `ecsd_expert` calls OpenAI for assistant behavior

### Data Paths

- `ecsd_api` uses MongoDB for primary application data
- `ecsd_api` also uses MongoDB for file-related data paths
- `ecsd_expert` uses MongoDB for chat-related data
- `ecsd_scheduler` is intended to use MongoDB-backed job data

## Legacy Container Topology

The older compose-based deployment adds `ecsd_proxy` in front of the services:

- `/` -> `console`
- `/api` -> `api`
- `/expert` -> `expert`
- `/mail` -> `mail`

That legacy topology is still useful as a behavioral reference, but it is not the primary way to understand the platform structure.

## Known Topology Mismatch

There is one recurring mismatch worth documenting:

- local expert development commonly uses port `8081`
- the legacy proxy/container path has historically pointed expert traffic at `8082`

When changing expert deployment or proxying behavior, verify the intended runtime port in code and container config rather than assuming one global value.
