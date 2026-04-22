# GCP Deployment Proposal

## Scope and intent

This proposal is grounded in the current repository contents. Statements marked **Evidence** describe what is in the repo today. Statements marked **Recommendation** describe a practical target state for Google Cloud Platform (GCP).

## Platform inventory and how each piece maps to GCP

| Repo area | What it appears to be | Repo evidence | Recommended GCP runtime |
| --- | --- | --- | --- |
| `ecsd_console` | Main web admin/user portal | React app with runtime env injection (`ecsd_console/package.json`, `ecsd_console/public/runtime-env.js`, `ecsd_console/docker/Dockerfile`) | **Cloud Run** serving the built static app through its containerized Nginx server. For the cost-optimized first production cut, make this the only public Cloud Run service and use Nginx path proxying for backend services. |
| `ecsd_api` | Primary backend API | Express app on port `8080`, Mongo-backed, many business routes, calls mail service via `MAIL_API_URL` (`ecsd_api/src/server.js`, `ecsd_api/src/app.js`, `ecsd_api/src/services/http.service.js`) | **Cloud Run** service for the API. |
| `ecsd_expert` | AI/chat backend | Express app on port `8081`, chat routes, OpenAI integration, separate Mongo connection (`ecsd_expert/src/server.js`, `ecsd_expert/src/app.js`, `ecsd_expert/src/services/chatgpt/open-ai.library.js`) | **Cloud Run** service for the expert/chat API. |
| `ecsd_mail` | Transactional mail microservice | Spring Boot service using Postmark (`ecsd_mail/pom.xml`, `ecsd_mail/src/main/resources/application.properties`) | **Cloud Run** service for mail sending. |
| `ecsd_proxy` | Reverse proxy / TLS terminator for composed stack | Nginx routes `/api`, `/expert`, `/mail`, and `/` to internal services (`ecsd_proxy/configs/default.conf`) | Do not deploy as a separate first-cut service. Move the needed path routing into the `ecsd_console` Nginx container to avoid the load balancer monthly floor. |
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

Use a cost-optimized container-first architecture on **Cloud Run**, backed by a **single-node MongoDB deployment hosted in GCP** and standard GCP platform services. Manage the production environment through a new top-level **`ecsd_infra` Pulumi project** so infrastructure changes have a single auditable source of truth in the repo.

- **Cloud Run domain mapping**
  - Single public domain: `smartcomplai.ecscompliance.com`
  - External DNS remains outside GCP; add the DNS records returned by Cloud Run domain mapping at the current DNS provider
  - Do not reuse the existing regional static IP in the first cost-optimized cut
- **Console Nginx as public ingress**
  - Map `smartcomplai.ecscompliance.com` to the `console` Cloud Run service
  - Serve the React app at `/`
  - Proxy `/api`, `/expert`, and any required internal HTTP paths to backend Cloud Run services through their generated Cloud Run service URLs
  - This replaces the first-cut need for a regional HTTPS load balancer
  - First cut grants public invocation to the backend Cloud Run services so Nginx can proxy with standard HTTP; restrict this later with service-to-service auth or a load balancer
  - Backend generated `run.app` URLs will exist and be publicly invokable even though no custom DNS records are created for them
- **Cloud Run services**
  - `console`
  - `api`
  - `expert`
  - `mail`
  - `scheduler`
- **Artifact Registry**
  - Store built container images
- **Secret Manager**
  - Store JWT secrets, Mongo URIs, Postmark key, OpenAI key, and runtime env values
- **Cloud Logging / Monitoring / Error Reporting**
  - Centralized logs, dashboards, alerting
- **Single-node MongoDB on Compute Engine**
  - Lowest-risk database choice that stays inside GCP because the code already expects Mongo connection strings and multiple logical Mongo databases
  - Run MongoDB on one small dedicated Compute Engine instance with a persistent disk, private networking, backups, and monitoring
  - Keep Mongo private-only regardless of budget; Cloud Run reaches Mongo through private VPC connectivity
  - Temporarily allow public egress during initial VM bootstrap if Mongo packages must be installed from internet repositories, then remove the public IP in a follow-up apply
  - Use a single-node replica set if the driver/runtime benefits from replica-set URI semantics
- **GridFS in MongoDB**
  - Keep the existing GridFS-backed upload/download path for the image/file routes that already use Mongo buckets
- **No first-cut Filestore**
  - Do not provision Filestore in the cost-optimized first cut
  - Durable file storage should use GridFS initially
  - Local Cloud Run filesystem paths should be treated as temporary/ephemeral until code is moved to GridFS or GCS
- **Optional later**
  - Regional or global external HTTPS Load Balancer for managed path routing, static IP support, Cloud Armor, and CDN integration
  - Filestore or Cloud Storage-backed file handling if filesystem-backed flows still need durable shared storage
  - Multi-node MongoDB replica set for availability and failover
  - Cloud CDN in front of the console
  - Cloud Run Job for `ecsd_scheduler`
  - A later move from mounted filesystem paths to Cloud Storage APIs if the team wants a cleaner cloud-native file model

## Proposed infrastructure project: `ecsd_infra`

### Recommendation

Create a new repo area named `ecsd_infra` dedicated to GCP infrastructure provisioning with Pulumi. For the first rollout, keep this project intentionally narrow and production-focused.

### What `ecsd_infra` should own

- GCP project-level bootstrap inputs and shared metadata used by production deployment
- Artifact Registry repositories used by application image builds
- Service accounts and IAM bindings for runtime services and CI/CD deployers
- Secret Manager secret containers, secret version wiring strategy, and access policies
- Cloud Run services for `console`, `api`, `expert`, and `mail`
- Cloud Run domain mapping for the public console/Nginx entrypoint
- Logging, monitoring, uptime checks, and baseline alerting resources
- Network primitives required for private connectivity, including any VPC connector or private service path needed by the production design
- MongoDB Compute Engine instance, private firewalling, generated Mongo credentials, and first-cut backup hooks/placeholders

### What `ecsd_infra` should not own in the first production phase

- Application code build logic beyond the minimum outputs Pulumi needs to reference images
- A staging environment
- `ecsd_scheduler` unless the team confirms it is production-critical
- A database migration away from MongoDB
- A first-cut regional HTTPS Load Balancer, unless domain mapping cannot satisfy the production DNS/certificate requirements
- Filestore or another always-on shared filesystem
- Broad platform abstractions for multiple clouds or multiple tenants

### Suggested initial layout

```text
ecsd_infra/
  Pulumi.yaml
  Pulumi.prod.yaml
  README.md
  package.json
  src/
    index.ts
    config.ts
    artifact-registry.ts
    iam.ts
    secrets.ts
    networking.ts
    cloud-run.ts
    domain-mapping.ts
    monitoring.ts
```

### Suggested Pulumi responsibilities

- `config.ts`: typed stack config, naming, labels, region, domain, and image/tag inputs
- `artifact-registry.ts`: image repositories and write/read permissions
- `iam.ts`: runtime and deployer service accounts, least-privilege role bindings
- `secrets.ts`: secret definitions, access grants, and references consumed by Cloud Run
- `networking.ts`: production networking prerequisites, including any private egress path needed for MongoDB and third-party access controls
- `cloud-run.ts`: each production service definition, env var injection, secret mounts/references, concurrency, CPU/memory, min instances, and ingress
- `domain-mapping.ts`: Cloud Run domain mapping for `smartcomplai.ecscompliance.com` and outputs for DNS records that must be created at the external DNS provider
- `monitoring.ts`: uptime checks, alert policies, log-based metrics, notification channels placeholders

## Production secrets and runtime config inventory

### Recommendation

Create the Secret Manager containers in Pulumi, but provide real secret **versions** separately during production setup. The Pulumi stack can safely define secret names and grant Cloud Run access; the secret payloads should be set with `gcloud secrets versions add ...` or a controlled secret-promotion process.

### Secrets that need production values

| Secret Manager logical name | Consumed by | Runtime env var(s) | Localhost/dev value currently checked in | Purpose | Required before first live deploy |
| --- | --- | --- | --- | --- | --- |
| `prod-jwt-secret` | `api`, `expert` | `JWT_SECRET` | `token` | JWT signing/verification shared between backend services | Yes |
| `ecsd-prod-mongo-database-url` | `api` | `DATABASE_URL` | `mongodb://localhost:27017/ecsd?` | Main API MongoDB URI for database `ecsd`; generated by Pulumi from the private replica-set seed list and generated credentials | Yes |
| `ecsd-prod-mongo-files-database-url` | `api` | `FILES_DB_URL` | `mongodb://localhost:27017/ecsd_files?` | GridFS/files MongoDB URI for database `ecsd_files`; generated by Pulumi from the private replica-set seed list and generated credentials | Yes |
| `ecsd-prod-mongo-chat-database-url` | `expert` | `CHAT_DATABASE_URL` | `mongodb://localhost:27017/ecsd_chat?` | Expert/chat MongoDB URI for database `ecsd_chat`; generated by Pulumi from the private replica-set seed list and generated credentials | Yes |
| `ecsd-prod-mongo-agenda-database-url` | `scheduler` | `AGENDA_DATABASE_URL` | Scheduler previously hardcoded `mongodb://localhost/agenda` | Scheduler MongoDB URI for database `agenda`; generated by Pulumi from the private replica-set seed list and generated credentials | Yes |
| `prod-mongo-username` / configured `mongoUsernameSecretName` | Mongo bootstrap / operators | n/a directly today | Not set locally | Mongo application user name; generated by Pulumi as `ecsd_app` | Yes |
| `prod-mongo-password` / configured `mongoPasswordSecretName` | Mongo bootstrap / operators | n/a directly today | Not set locally | Mongo application user password; generated by Pulumi | Yes |
| `prod-openai-api-key` | `expert` | `OPENAI_API_KEY`, `OPEN_AI_API_KEY` | Empty in `ecsd_expert/.env*` | OpenAI API authentication; both variable spellings are used in code | Yes for expert/chat functionality |
| `prod-openai-assistant-id` | `expert` | `OPEN_AI_ASSISTANT_ID` | Empty in `ecsd_expert/.env*` | OpenAI Assistant identifier used by expert/chat code | Yes for expert/chat functionality |
| `prod-postmark-api-key` | `mail` | `POSTMARK_APIKEY` | Not set in checked-in local env; `application.properties` reads `${POSTMARK_APIKEY}` | Postmark transactional mail API key | Yes for production email |
| `prod-mailtrap-user` | `api` | `MAILTRAP_USER` | Empty in `ecsd_api/.env*` | Legacy SMTP fallback credentials in auth flow | No if Postmark-only mail path is confirmed |
| `prod-mailtrap-password` | `api` | `MAILTRAP_PASSWORD` | Empty in `ecsd_api/.env*` | Legacy SMTP fallback credentials in auth flow | No if Postmark-only mail path is confirmed |

### Plain runtime config currently wired in Pulumi

| Service | Env var | Production value |
| --- | --- | --- |
| `console` | `REACT_APP_API_URL` | `https://smartcomplai.ecscompliance.com/api` |
| `console` | `REACT_APP_IMAGES` | `https://smartcomplai.ecscompliance.com` |
| `console` | `REACT_APP_URL` | `https://smartcomplai.ecscompliance.com` |
| `console` | `REACT_APP_IS_DEMO` | `false` |
| `api` | `APP_URL_CLIENT` | `https://smartcomplai.ecscompliance.com` |
| `api` | `APP_URL_API` | `https://smartcomplai.ecscompliance.com/api` |
| `api` | `MAIL_API_URL` | `https://smartcomplai.ecscompliance.com/mail` |
| `api` | `FILES_DB` | `ecsd` for the first pass unless split back to `ecsd_files` |
| `api` | `IMG_BUCKET` | `images` |
| `expert` | `APP_URL_CLIENT` | `https://smartcomplai.ecscompliance.com` |
| `expert` | `APP_URL_API` | `https://smartcomplai.ecscompliance.com/expert` |

### Local image build and push workflow

The first local CI workflow is intentionally simple and operator-driven:

```bash
cd ecsd_infra
npm run images:push
```

This builds and pushes the `console`, `api`, `expert`, `mail`, and `scheduler` images to:

```text
us-central1-docker.pkg.dev/smartcomplai/ecsd/<service>:prod
```

Required local prerequisites:

- Docker is installed and can build Linux images.
- `gcloud` is authenticated to the `smartcomplai` project.
- Docker is authenticated to Artifact Registry with `gcloud auth configure-docker us-central1-docker.pkg.dev`.
- The `ecsd` Artifact Registry repository exists, either from Pulumi or created before the first push.
- The first local workflow pushes both an immutable git-SHA tag and a mutable `prod` alias by default.

Details still needed before this becomes a real CI/CD pipeline:

- Which CI host should run it later: GitHub Actions, Cloud Build, or another runner. For now, keep this local-only to limit scope.
- Which Google Cloud identity should push images and run Pulumi once this moves out of a local operator workflow.
- Whether images should be built for `linux/amd64` only or multi-arch.
- Whether the pipeline should run tests before image push.

## Production-first implementation strategy

### Recommendation

Treat the first GCP delivery as a **production-only foundation phase**. The goal is not full environment parity; it is to create a stable, reviewable production baseline in `ecsd_infra` that can later be cloned into staging with less ambiguity.

### Phase 1 deliverables for a production-only launch

- Create `ecsd_infra` and define a single `prod` stack in Pulumi
- Establish naming conventions, labels, region choice, and required stack configuration before service-specific resources are added
- Build the Pulumi project in layers so later modules depend on stable shared contracts:
  - shared config/types/naming
  - Artifact Registry, IAM, and Secret Manager
  - networking and Mongo prerequisites
  - Cloud Run services
  - Cloud Run domain mapping and console/Nginx routing
- Provision Artifact Registry, runtime/deployer service accounts, and IAM bindings
- Provision Secret Manager containers and document how secret versions will be promoted
- Provision Cloud Run services for `console`, `api`, `expert`, `mail`, and `scheduler`
- Make `console` the public Cloud Run service mapped to `smartcomplai.ecscompliance.com`
- Add Nginx path routing in the console container for `/api`, `/expert`, and any other required backend paths
- Provision one private MongoDB VM on `e2-small` with a small persistent disk and generated application credentials
- Keep API `minInstances: 1`; keep the other Cloud Run services at `minInstances: 0`
- Do not provision Filestore or an external HTTPS load balancer in the first cost-optimized cut
- Define baseline observability: logs, uptime checks, error alerting, and dashboard placeholders
- Document external dependencies that remain outside Pulumi at first if needed, especially DNS registrar changes and any temporary Mongo bootstrap access
- Keep a dedicated integration pass at the end of the phase to validate module interfaces, stack config completeness, and deploy-time assumptions before rollout work begins

### Items that can wait until after Phase 1

- Staging stack duplication
- More advanced autoscaling policies tuned from production metrics
- External HTTPS Load Balancer for managed path routing, static IP support, Cloud Armor, and CDN integration
- Filestore or Cloud Storage-backed durable filesystem replacement if GridFS does not cover all current file flows
- Multi-node MongoDB replica set
- Cloud CDN
- Database/storage redesign work

### Why this is the lowest-risk path

- It preserves the current service split from `ecsd_docker/compose.yml`.
- It avoids rewriting the data layer to fit Cloud SQL or Firestore.
- It keeps the database inside GCP instead of depending on Mongo Atlas.
- It removes the need to manage Docker Compose, host TLS, certbot, Filestore, and a paid load balancer in the first cut.
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
- Confirm the production domains required for web, API, expert, and mobile deep links.
- Confirm whether the production-only first phase should use a dedicated prod GCP project immediately or share an existing organization/project hierarchy temporarily.

### Phase 1: Bootstrap `ecsd_infra` for production

- Create the `ecsd_infra` Pulumi project and define the `prod` stack.
- Encode naming, region, labels, service identities, and shared config in code before service-specific modules are implemented.
- Split the Pulumi project into explicit modules with clear ownership boundaries:
  - `config.ts` / shared types and naming
  - `artifact-registry.ts`
  - `iam.ts`
  - `secrets.ts`
  - `networking.ts`
  - `cloud-run.ts`
  - `domain-mapping.ts`
  - `monitoring.ts`
- Treat shared config/types as the dependency boundary for all later modules.
- Assume Cloud Run domain mapping for `smartcomplai.ecscompliance.com`; do not reuse the existing static IP in the first cost-optimized cut.
- Keep the initial scope limited to the currently required production services: `console`, `api`, `expert`, `mail`, and `scheduler`.

### Phase 2: Foundation modules and platform prerequisites

- Implement Artifact Registry, IAM, Secret Manager, networking, and monitoring modules against the shared config contract.
- Add one private MongoDB VM in Pulumi with `e2-small`, a small persistent disk, private firewalling, generated credentials, and single-node replica-set support if needed.
- Keep Mongo runtime private-only. If package/bootstrap access needs internet, use `mongoEnablePublicIpForBootstrap=true` only for the first deploy, then set it to `false` and re-apply; longer term, prefer a prebaked image.
- Do not add Filestore in phase 1. Treat remaining local filesystem paths as temporary and keep durable file storage on GridFS until the app is moved to GCS or another durable backend.
- Use this phase to lock down the stack inputs and outputs that the Cloud Run and domain mapping modules will consume.

### Phase 3: Service deployment and ingress wiring

- Implement Cloud Run services for `console`, `api`, `expert`, `mail`, and `scheduler`.
- Wire service accounts, secrets, image references, ports, and environment variables through the shared module interfaces defined earlier.
- Implement Cloud Run domain mapping for `smartcomplai.ecscompliance.com` to the `console` service.
- Create backend Cloud Run services first, feed their generated service URLs into the console service as `API_PROXY_URL`, `EXPERT_PROXY_URL`, and `MAIL_PROXY_URL`, then create the console service.
- Update the console Nginx container to proxy `/api`, `/expert`, and any required backend paths to the appropriate Cloud Run service URLs.
- Set `api` to `minInstances: 1`; keep `console`, `expert`, `mail`, and `scheduler` at `minInstances: 0`.
- Complete private networking and egress design needed by Cloud Run services.
- Keep GridFS-backed routes on MongoDB and avoid durable shared filesystem mounts in the first cut.

### Phase 4: Integration validation and deployability hardening

- Run a dedicated integration pass across all modules.
- Validate that Cloud Run outputs, Nginx upstreams, domain mapping DNS records, secrets, networking, and Mongo assumptions all line up.
- Standardize each service Docker build for Cloud Run.
- Normalize service ports so Cloud Run configuration is explicit and consistent.
- Replace local-only URLs in runtime configs with environment-driven public base URLs.
- Remove any assumption that services can reach each other by Docker Compose hostname.
- Align CI build outputs so `ecsd_infra` can deploy immutable image references.
- Validate backup, restore, patching, and operational ownership for MongoDB.

### Phase 5: CI/CD and rollout

- Add image build, push, and deploy automation.
- Add a production deployment path that updates Pulumi config/image tags and applies reviewed changes.
- Update mobile environment files to point to GCP endpoints.
- Execute cutover and rollback runbooks.

### Phase 6: Post-cutover cleanup

- Add staging by cloning the proven `prod` stack design with explicit environment deltas.
- Retire Compose-based production hosting.
- Document runbooks, rollback steps, and secret rotation.
- Reassess whether console-hosted Nginx routing, API warm instances, and mail-service separation still provide value.

## Recommended later additions intentionally cut from phase 1

The selected first production cut optimizes for a low monthly bill, estimated at roughly `$28-$36/month` with the API kept warm. The following items are intentionally deferred, not rejected:

| Deferred item | Why it is cut from phase 1 | When to add it |
| --- | --- | --- |
| External HTTPS Load Balancer | Adds an approximate `$18/month` floor before traffic. Domain mapping plus console/Nginx routing preserves the single-domain shape more cheaply. | Add when static IP reuse, Cloud Armor, managed path routing, CDN integration, or production-grade ingress controls become more important than the monthly floor. |
| Filestore | Basic HDD has a large minimum capacity and was the largest projected cost. It was only added to preserve filesystem semantics with minimal app changes. | Add Filestore or, preferably, move filesystem-backed flows to GCS if GridFS does not cover uploads/profile images/generated PDFs reliably. |
| Three-node MongoDB replica set | Multi-zone HA is materially more expensive than the budget target. | Add when uptime requirements justify failover, or when production data volume/usage makes single-node recovery risk unacceptable. |
| Cloud NAT for private VM bootstrap egress | Clean, but too expensive for this target. | Add if temporary bootstrap access becomes operationally fragile or security policy forbids temporary external bootstrap access. |
| Static IP reuse | Requires the load balancer or a proxy VM. | Add with the load balancer if DNS or allowlist requirements require a stable inbound IP. |
| Private backend invocation | Console-hosted Nginx cannot add Google-signed identity tokens with the current plain nginx image, so backend services are publicly invokable on their generated Cloud Run URLs behind CORS/app auth in phase 1. | Add when ingress hardening becomes a priority, either by adding service-to-service auth support to the proxy or by moving path routing to a load balancer. |

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
- Have CI produce immutable image tags/digests that `ecsd_infra` consumes for deployment.
- Use Pulumi previews as the infrastructure change review mechanism before production apply.
- Start with a production-only deployment pipeline; add staging only after the production stack layout is stable.
- Prefer workload identity / deploy-time service accounts over long-lived JSON keys.
- Keep deploys per service so `console`, `api`, `expert`, and `mail` can roll independently.

## Risks and open questions

- **Port inconsistency:** local README says expert runs on `8081`, but proxy config points to `expert:8082`; this needs one source of truth before deployment.
- **Database shape:** the code assumes multiple Mongo databases/URIs. A GCP-hosted MongoDB deployment fits that model; Cloud SQL would not be a drop-in replacement.
- **Operational ownership:** moving off Atlas means backups, patching, replica-set health, and restore testing become part of the GCP operations scope.
- **File storage path:** the stack uses both Mongo/GridFS and local filesystem writes today. Phase 1 now assumes GridFS is the durable file store and any remaining Cloud Run local filesystem usage is temporary/ephemeral until the app is moved to GCS or another durable backend.
- **Public URL assumptions:** seeded data and email links embed `APP_URL_API` and `APP_URL_CLIENT`; staging/production URL handling must be explicit.
- **Chosen production hostname:** phase 1 should assume a single public domain, `smartcomplai.ecscompliance.com`, mapped to the console Cloud Run service with path routing handled by console-hosted Nginx.
- **CORS behavior:** both Node services gate CORS using `APP_URL_CLIENT`; production domains must be finalized before launch.
- **Backend public invocation:** the cost-optimized Nginx/domain-mapping design makes backend services publicly invokable on their generated Cloud Run URLs unless the proxy is enhanced to perform authenticated Cloud Run service-to-service calls.
- **Scheduler status:** `ecsd_scheduler` is not part of the Compose deployment, so it may be obsolete or unfinished.
- **Mail topology:** keeping `ecsd_mail` separate improves isolation but adds another deployed unit and another internal hop.
- **Pulumi runtime:** `ecsd_infra` should use TypeScript so infrastructure code aligns with the repo's existing Node-heavy tooling and lowers onboarding friction.
- **State backend and secret handling:** confirm whether Pulumi state will live in Pulumi Cloud, GCS, or another backend, and who owns access to stack secrets.
- **CI ownership boundary:** decide whether application CI updates Pulumi stack config automatically or whether production deploys require an explicit infra repo change/review step.
- **Project bootstrap boundary:** confirm whether foundational org/project setup, billing, and APIs are managed in `ecsd_infra` or handled once manually before Pulumi takes over.
- **DNS and certificate ownership:** confirm who controls the production domains and whether certificate validation can be automated without cross-team delays.
- **MongoDB management boundary:** phase 1 provisions one private MongoDB VM in Pulumi; backups, restore testing, and later HA upgrades still need operational follow-through.

## Recommended first decision

Proceed with a **cost-optimized Cloud Run + Cloud Run domain mapping + console-hosted Nginx path proxy + Secret Manager + single private MongoDB VM with GridFS** design, and create **`ecsd_infra` as the production infrastructure source of truth using Pulumi**. Keep API `minInstances: 1`, keep other Cloud Run services at `0`, defer Filestore and the external HTTPS load balancer, and treat the first phase as a pragmatic production baseline that can be hardened after real usage and budget review.
