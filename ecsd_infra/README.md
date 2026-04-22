# ECSD Infra

This directory is the Pulumi source of truth for the ECSD production environment on GCP.

## Initial scope

The scaffold is production-first. It captures the stack config and naming conventions needed to bootstrap:

- GCP project and region
- base domain and DNS zone
- Artifact Registry repository
- Cloud Run service names, paths, and image references
- MongoDB host placement for the first production cut
- GridFS for the existing Mongo-backed file routes
- Cloud Run domain mapping for the cost-optimized public ingress path

The default production routing assumption is a single public domain with path routing:

- `https://smartcomplai.ecscompliance.com/` -> `console`
- `https://smartcomplai.ecscompliance.com/api` -> `api`
- `https://smartcomplai.ecscompliance.com/expert` -> `expert`
- `https://smartcomplai.ecscompliance.com/mail` -> `mail`

DNS does not need to be hosted in GCP for this to work. The cost-optimized first cut uses Cloud Run domain mappings and your existing DNS provider must add the DNS records exported by the stack.

The public custom domain maps to the `console` Cloud Run service. The console Nginx container proxies path traffic to backend services through the generated Cloud Run service URLs exported by the backend service resources.

The regional external HTTPS load balancer and static IP reuse are intentionally deferred to keep the first production bill low.
Because the first-cut proxy is plain Nginx, the backend Cloud Run services are publicly invokable on their generated Cloud Run URLs. App auth and CORS still apply, but private backend invocation should be added later through service-to-service auth support or a load balancer.

This means only `smartcomplai.ecscompliance.com` needs an external DNS record, but the generated backend `run.app` URLs will still exist and accept requests from the internet if the caller has the URL.

The current program now wires the first-pass production stack together. It instantiates:

- Artifact Registry
- service accounts and placeholder secrets
- monitoring placeholders
- state-backend bucket bootstrap resources
- application VPC and subnet prerequisites
- a self-managed single-node MongoDB module
- Cloud Run services for `console`, `api`, `expert`, `mail`, and `scheduler`
- Cloud Run domain mappings for the public and backend hostnames

The first production plan does not create Filestore, Cloud NAT, or an external HTTPS load balancer. Durable file storage remains on GridFS; any remaining local filesystem usage in Cloud Run should be treated as temporary until the app is moved to GridFS or GCS.

`mongoEnablePublicIpForBootstrap` is set to `true` for the first deploy so the Debian startup script can install MongoDB packages without Cloud NAT. MongoDB ingress remains firewalled to private ranges; the public IP is for outbound bootstrap only. After Mongo is installed and initialized, set this config to `false` and re-apply so the steady-state Mongo VM has no public IP.

The main reusable modules under `src/` are:

- `src/networking.ts` models the application VPC/subnet needed for Cloud Run direct VPC access and private Mongo connectivity. The app subnet defaults to `/24` so Cloud Run direct VPC egress has enough IP capacity. The legacy regional load balancer prerequisite component remains available for a later hardened ingress phase.
- `src/domain-mapping.ts` models Cloud Run domain mappings and exports DNS records that must be created at the external DNS provider.
- `src/mongo.ts` models a first-pass self-managed MongoDB deployment on Compute Engine, including VM and persistent-disk resources, private ingress firewalling, and exported app/runtime connection assumptions.
- `src/cloud-run.ts` models the first-pass Cloud Run v2 service layer for `console`, `api`, `expert`, `mail`, and `scheduler`, with image refs from stack config plus override hooks for service accounts, env vars, secret refs, volumes, ingress, and revision sizing defaults.

## Module layout

The scaffold is split into shared modules so later resource files can consume the same contracts:

- `index.ts` exposes the current Pulumi stack outputs
- `src/config.ts` loads and normalizes typed stack config
- `src/naming.ts` centralizes service naming and URL helpers
- `src/types.ts` defines reusable config and normalized service types
- `src/domain-mapping.ts` defines Cloud Run domain mapping resources
- `src/load-balancer.ts` defines the deferred standalone regional external HTTPS load balancer component
- `src/mongo.ts` defines the standalone self-managed MongoDB component
- `src/cloud-run.ts` defines the standalone Cloud Run v2 component

## Domain mapping notes

`src/domain-mapping.ts` creates the Cloud Run domain mapping for the first cost-optimized ingress path. After `pulumi up`, add the exported DNS records for `smartcomplai.ecscompliance.com` at the external DNS provider.

This avoids the load balancer monthly floor but intentionally gives up static IP reuse, Cloud Armor, CDN integration, and managed load-balancer path routing for phase 1.

## Cloud Run module notes

`src/cloud-run.ts` is intentionally a buildable first pass for the current production services rather than a full deployment graph. It currently:

- consumes the existing normalized `services` config and expects entries for `console`, `api`, `expert`, `mail`, and `scheduler`
- creates one Cloud Run v2 service per app image, preserving the existing image refs from stack config
- applies low-cost defaults by service, including `api` `minInstances: 1` and `console`/`expert`/`mail`/`scheduler` `minInstances: 0`
- exposes override hooks for per-service runtime settings, service account email, plain env vars, Secret Manager env refs, and volume placeholders
- is now instantiated by the root stack with per-service runtime identities
- now uses direct VPC network interfaces for the Mongo-adjacent services
- uses all-traffic ingress for the domain-mapped first cut

It does not yet solve:

- load-balancer-only invocation policy
- concrete app env var inventory or service-specific secret hardening
- health-probe tuning or service-specific autoscaling derived from production telemetry

## MongoDB module notes

`src/mongo.ts` is intentionally a realistic first pass rather than a complete production database implementation. It currently:

- assumes a self-managed Compute Engine replica set topology with an odd number of members
- provisions one VM and one persistent data disk per member
- exports the seed list, replica-set URI template, secret-name defaults, and app-facing environment inputs
- uses a startup script placeholder that can write `mongod` config and start the service when the image already contains MongoDB

It does not yet solve:

- image baking or package installation hardening for `mongod`
- backup automation, restore testing, or upgrades
- private DNS, service discovery, or failover automation beyond seed-list outputs
- TLS, KMS, or secret material provisioning

## Prerequisites

- Node.js 20+
- Pulumi CLI
- Access to the target GCP project

## First-time setup

```bash
cd ecsd_infra
npm install
pulumi login
pulumi stack select prod || pulumi stack init prod
pulumi config set gcp:project smartcomplai
pulumi config set gcp:region <gcp-region>
```

The chosen state backend is GCS. That creates a bootstrap caveat: the bucket must exist before `pulumi login gs://...` can succeed. For now, either:

- create `smartcomplai-pulumi-state` once outside this stack, then `pulumi login gs://smartcomplai-pulumi-state`
- or use a temporary backend, create the bucket with Pulumi, and then migrate state

If you keep the checked-in `Pulumi.prod.yaml`, verify the four domain mappings before running the first production apply.

## Validation

```bash
npm run build
```

## Image Build And Push

The first local workflow for producing Cloud Run images is:

```bash
cd ecsd_infra
npm run images:push
```

The script builds and pushes `console`, `api`, `expert`, `mail`, and `scheduler` to `us-central1-docker.pkg.dev/smartcomplai/ecsd/<service>`. By default, each image gets both the current git short SHA tag and the mutable `prod` alias.

Required local setup:

- Docker with Buildx support
- `gcloud auth configure-docker us-central1-docker.pkg.dev`
- Artifact Registry repository `ecsd` available in project `smartcomplai`

Useful overrides:

```bash
SHA_TAG="$(git rev-parse --short HEAD)" npm run images:push
ALIAS_TAG= npm run images:push
PLATFORM=linux/amd64 npm run images:push api console
```

## Production Baseline Bootstrap

Pulumi creates a Cloud Run Job named `prod-baseline-bootstrap`. It runs the API image inside the private VPC and idempotently ensures baseline permissions, roles, and users exist without deleting existing production users.

Run it after the API image has been pushed and Pulumi has applied the job definition:

```bash
gcloud run jobs execute prod-baseline-bootstrap \
  --region us-central1 \
  --project smartcomplai \
  --wait
```

Expected summary includes `permissions: 17`, `roles: 3`, `users: 3`, and no duplicate permission warnings.

## Open production inputs

- Domain ownership verification for `ecscompliance.com` in the GCP project/service account that creates Cloud Run domain mappings.
- DNS records exported by Pulumi must be added at the external DNS provider.
- Mongo bootstrap currently uses temporary public egress from the VM. After first successful initialization, set `mongoEnablePublicIpForBootstrap=false` and re-apply, or replace this with a prebaked image.
- The final app env and secret inventory per service should be reviewed after the first Cloud Run smoke test.
