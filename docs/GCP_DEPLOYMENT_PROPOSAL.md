# GCP Deployment Proposal

## Scope and intent

This proposal is grounded in the current repository contents. Statements marked **Evidence** describe what is in the repo today. Statements marked **Recommendation** describe a practical target state for Google Cloud Platform (GCP).

## Platform inventory and how each piece maps to GCP

| Repo area | What it appears to be | Repo evidence | Recommended GCP runtime |
| --- | --- | --- | --- |
| `ecsd_console` | Main web admin/user portal | React app with runtime env injection (`ecsd_console/package.json`, `ecsd_console/public/runtime-env.js`, `ecsd_console/docker/Dockerfile`) | **Cloud Run** serving the built static app behind GCP HTTPS Load Balancer, or Cloud Storage + CDN if runtime env injection is redesigned. For least change, keep the containerized Nginx approach on Cloud Run. |
| `ecsd_api` | Primary backend API | Express app on port `8080`, Mongo-backed, many business routes, calls mail service via `MAIL_API_URL` (`ecsd_api/src/server.js`, `ecsd_api/src/app.js`, `ecsd_api/src/services/http.service.js`) | **Cloud Run** service for the API. |
| `ecsd_expert` | AI/chat backend | Express app on port `8081`, chat routes, OpenAI integration, separate Mongo connection (`ecsd_expert/src/server.js`, `ecsd_expert/src/app.js`, `ecsd_expert/src/services/chatgpt/open-ai.library.js`) | **Cloud Run** service for the expert/chat API. |
| `ecsd_mail` | Transactional mail microservice | Spring Boot service using Postmark (`ecsd_mail/pom.xml`, `ecsd_mail/src/main/resources/application.properties`) | **Cloud Run** service for mail sending. |
| `ecsd_proxy` | Reverse proxy / TLS terminator for composed stack | Nginx routes `/api`, `/expert`, `/mail`, and `/` to internal services (`ecsd_proxy/configs/default.conf`) | Replace with **GCP External HTTPS Load Balancer** path routing. Keep Nginx only if there is a short-term compatibility reason. |
| `ecsd_docker` | Current deployed Docker Compose stack | Compose file wires `nginx`, `api`, `console`, `mail`, `expert` (`ecsd_docker/compose.yml`) | Replace with separate Cloud Run services plus shared CI/CD and secrets. |
| `ecsd_mobile` | Flutter mobile client | Mobile services read API/chat host, port, scheme, and path from dotenv (`ecsd_mobile/lib/services/helper_service.dart`, `ecsd_mobile/lib/services/chat_helper_service.dart`) | Not hosted on GCP as a runtime service; point mobile builds at GCP-hosted API and expert endpoints. |
| `ecsd_forms` | SurveyJS form renderer embedded in mobile app | README says it is embedded in the mobile app (`ecsd_forms/README.md`) | Usually no standalone GCP runtime needed unless the team chooses to deploy it as a separate web app later. |
| `ecsd_scheduler` | Background job runner prototype | Uses Agenda with hardcoded local Mongo address `mongodb://localhost/agenda`; not wired into compose (`ecsd_scheduler/src/app.js`, `ecsd_docker/compose.yml`) | Treat as optional future **Cloud Run Job** or separate **Cloud Run** worker after confirming it is still needed. |

## Current local/dev topology and service communication

### Evidence

- The top-level README describes the active local workflow as:
  - MongoDB in Docker on `localhost:27017`
  - `ecsd_api` on `http://localhost:8080`
  - `ecsd_expert` on `http://localhost:8081`
  - `ecsd_console` on `http://localhost:3000`
- The deployed Compose topology adds `nginx`, `mail`, and TLS/certbot. In that stack, Nginx proxies:
  - `/api` -> `api:8080`
  - `/expert` -> `expert:8082`
  - `/mail` -> `mail:8080`
  - `/` -> `console:80`
- The console browser app talks directly to the API base URL from `window._env_.REACT_APP_API_URL`.
- The mobile app separately targets API and chat services via dotenv-based host/port settings.
- The API calls the mail service via `MAIL_API_URL`.
- The API and expert service each connect to MongoDB using separate environment variables:
  - `DATABASE_URL` for the main API database
  - `FILES_DB_URL` for uploaded files/images
  - `CHAT_DATABASE_URL` for expert/chat data
- The repo already documents MongoDB as a deployment dependency in `docs/DEPLOYMENT.md`, which suggests the code is already aligned with a MongoDB-backed deployment rather than a GCP-native database rewrite.

### Current communication summary

1. Browser -> `ecsd_console` -> direct HTTP calls to `ecsd_api`
2. Mobile app -> `ecsd_api`
3. Mobile app -> `ecsd_expert`
4. `ecsd_api` -> `ecsd_mail`
5. `ecsd_api` -> MongoDB main DB and files DB
6. `ecsd_expert` -> MongoDB chat DB
7. `ecsd_expert` -> OpenAI API
8. `ecsd_mail` -> Postmark API

## Recommended target architecture on GCP

### Recommendation

Use a container-first architecture on **Cloud Run**, backed by a **MongoDB replica set hosted in GCP** and standard GCP platform services:

- **Global HTTPS Load Balancer**
  - Single public domain
  - Path routing for `/`, `/api`, `/expert`, and optionally `/mail`
- **Cloud Run services**
  - `console`
  - `api`
  - `expert`
  - `mail`
- **Artifact Registry**
  - Store built container images
- **Secret Manager**
  - Store JWT secrets, Mongo URIs, Postmark key, OpenAI key, and runtime env values
- **Cloud Logging / Monitoring / Error Reporting**
  - Centralized logs, dashboards, alerting
- **MongoDB replica set on Compute Engine**
  - Lowest-risk database choice that stays inside GCP because the code already expects Mongo connection strings, GridFS, and multiple logical Mongo databases
  - Run MongoDB on dedicated Compute Engine instances with persistent disks, private networking, backups, and monitoring
- **Optional later**
  - Cloud CDN in front of the console
  - Cloud Run Job for `ecsd_scheduler`
  - Cloud Storage if the team decides to move file handling away from Mongo/GridFS

### Why this is the lowest-risk path

- It preserves the current service split from `ecsd_docker/compose.yml`.
- It avoids rewriting the data layer to fit Cloud SQL or Firestore.
- It keeps the database inside GCP instead of depending on Mongo Atlas.
- It removes the need to manage VMs, Docker Compose, host TLS, and certbot.
- It keeps each service independently deployable.

## Record of any existing GCP deployment

### Evidence reviewed

- I found **no repo-level GCP deployment manifests or automation** such as Terraform, Cloud Build config, GKE manifests, or GitHub Actions workflows for GCP.
- Repository text search for `GCP`, `Google Cloud`, `Cloud Run`, `GKE`, `Artifact Registry`, and `cloudbuild` did not surface an existing GCP deployment plan or implementation.
- The only GCP-adjacent references I found were commented-out `gcr.io/distroless/...` base-image lines in several Dockerfiles, which are not evidence of a deployed GCP environment.
- I also did not find checked-in Codex session files under the repo’s visible `.codex` directories that would document a prior GCP rollout.

### Careful conclusion

There is **no clear record in this repository, or in the reviewed in-repo Codex artifacts, of an existing GCP deployment**. That is not proof that no external deployment ever existed; it means this repo does not currently provide an auditable GCP deployment source of truth.

## Phased implementation plan

### Phase 0: Confirm scope

- Confirm whether `ecsd_mail` should remain a separate service or be folded into `ecsd_api`.
- Confirm whether `ecsd_scheduler` is active and needs production scheduling.
- Confirm whether uploaded files must remain in Mongo/GridFS or can move to Cloud Storage.
- Confirm the production domains required for web, API, expert, and mobile deep links.

### Phase 1: Container and config hardening

- Standardize each service Docker build for Cloud Run.
- Normalize service ports so Cloud Run configuration is explicit and consistent.
- Replace local-only URLs in runtime configs with environment-driven public base URLs.
- Remove any assumption that services can reach each other by Docker Compose hostname.

### Phase 2: Core GCP foundation

- Create GCP project(s) for staging and production.
- Create Artifact Registry repositories.
- Create Secret Manager secrets for all sensitive configuration.
- Provision a MongoDB replica set in GCP region alignment with Cloud Run.
- Configure HTTPS Load Balancer and DNS.

### Phase 3: Deploy services

- Deploy `api`, `expert`, `mail`, and `console` to Cloud Run.
- Set ingress so services are private where possible, with the load balancer exposing only intended endpoints.
- Update mobile environment files to point to GCP endpoints.

### Phase 4: CI/CD and observability

- Add image build, push, and deploy automation.
- Add per-environment promotion flow from staging to production.
- Add structured logging, uptime checks, and alerting.

### Phase 5: Post-cutover cleanup

- Retire Compose-based production hosting.
- Document runbooks, rollback steps, and secret rotation.
- Reassess whether Nginx/proxy and mail-service separation still provide value.

## Environment and secrets considerations

### Evidence

The repo already expects environment-driven configuration for:

- Mongo URLs: `DATABASE_URL`, `FILES_DB_URL`, `CHAT_DATABASE_URL`
- App URLs: `APP_URL_CLIENT`, `APP_URL_API`
- Mail integration: `MAIL_API_URL`, `MAIL_API_HOST`, `MAIL_API_PORT`, `POSTMARK_APIKEY`
- Auth: `JWT_SECRET`
- AI integration: `OPENAI_API_KEY`, `OPEN_AI_ASSISTANT_ID`
- Frontend runtime env: `REACT_APP_API_URL`, `REACT_APP_URL`, `REACT_APP_IMAGES`

### Recommendation

- Store secrets only in **Secret Manager**.
- Inject non-secret config through Cloud Run environment variables.
- Do not ship secrets through `runtime-env.js`; keep the console runtime config public-only.
- Treat JWT secrets, Mongo URIs, OpenAI keys, and Postmark keys as independently rotatable.
- Maintain separate staging and production secret sets.

## CI/CD considerations

### Evidence

- The repo contains Dockerfiles and a Docker Compose deployment model.
- I did not find a checked-in CI workflow for building and deploying this stack.
- Current image naming in the repo points at `ghcr.io/llamalogic/...`.

### Recommendation

- Build containers in CI on every merge to the main deployment branch.
- Push images to **Artifact Registry**.
- Deploy to Cloud Run with separate staging and production pipelines.
- Prefer workload identity / deploy-time service accounts over long-lived JSON keys.
- Keep deploys per service so `console`, `api`, `expert`, and `mail` can roll independently.

## Risks and open questions

- **Port inconsistency:** local README says expert runs on `8081`, but proxy config points to `expert:8082`; this needs one source of truth before deployment.
- **Database shape:** the code assumes multiple Mongo databases/URIs plus GridFS-style file storage. A GCP-hosted MongoDB deployment fits that model; Cloud SQL would not be a drop-in replacement.
- **Operational ownership:** moving off Atlas means backups, patching, replica-set health, and restore testing become part of the GCP operations scope.
- **File storage path:** the stack references both a mounted `files/` volume and Mongo file storage concepts. Production persistence strategy should be clarified before cutover.
- **Public URL assumptions:** seeded data and email links embed `APP_URL_API` and `APP_URL_CLIENT`; staging/production URL handling must be explicit.
- **CORS behavior:** both Node services gate CORS using `APP_URL_CLIENT`; production domains must be finalized before launch.
- **Scheduler status:** `ecsd_scheduler` is not part of the Compose deployment, so it may be obsolete or unfinished.
- **Mail topology:** keeping `ecsd_mail` separate improves isolation but adds another deployed unit and another internal hop.

## Recommended first decision

Proceed with a **Cloud Run + HTTPS Load Balancer + Secret Manager + GCP-hosted MongoDB replica set** design, and treat the current Compose stack as the behavioral baseline to reproduce. That path fits the repo as it exists today and minimizes application rewrites while keeping the database directly in GCP.
