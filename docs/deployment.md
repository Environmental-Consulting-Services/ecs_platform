# Deployment

This document covers deployment at a high level:

- what the current production deployment looks like
- how to deploy and update application changes
- how to deploy and update infrastructure changes
- which infrastructure updates should still be made

This is intentionally high-level. The detailed infrastructure implementation belongs in `ecsd_infra`.

## High-Level Production Architecture

Production is a GCP deployment with:

- a single public domain at `smartcomplai.ecscompliance.com`
- path-based routing through the public console service
- separate service containers for `console`, `api`, `expert`, `mail`, and `scheduler`
- MongoDB hosted directly in GCP
- container images stored in Artifact Registry
- runtime secrets stored in Secret Manager

Public paths are organized around a single-domain surface:

- `/` -> console
- `/api` -> api
- `/expert` -> expert
- `/mail` -> mail

Readers should use this as a stable overview only. Resource-level implementation details belong in the Pulumi project.

## Deployment Units

The main deployment units are:

- `console`
- `api`
- `expert`
- `mail`
- `scheduler`
- MongoDB and supporting infrastructure

## App Deploy And Update Flow

Use an app-only deploy when only service code changed.

Typical flow:

1. Build and push the changed image.
2. Update the running service to the new image.
3. Run targeted smoke checks.

### Current Image Build And Push

```bash
cd ecsd_infra
npm run images:push
```

For a single service:

```bash
cd ecsd_infra
npm run images:push api
```

### Current Service Update Pattern

After pushing a new `:prod` image, update the running Cloud Run service:

```bash
export PROJECT_ID=smartcomplai
export REGION=us-central1

gcloud run services update ecsd-prod-api \
  --image us-central1-docker.pkg.dev/${PROJECT_ID}/ecsd/api:prod \
  --region ${REGION} \
  --project ${PROJECT_ID}
```

Use the matching service and image for the other deployable services.

### Baseline Bootstrap

If API seed or baseline bootstrap behavior changed:

```bash
gcloud run jobs execute prod-baseline-bootstrap \
  --region us-central1 \
  --project smartcomplai \
  --wait
```

### Smoke Checks

```bash
curl -I https://smartcomplai.ecscompliance.com
curl -fsS -o /dev/null -w "%{http_code}\n" https://smartcomplai.ecscompliance.com/api/login
```

## Infra Deploy And Update Flow

Use an infra deploy when networking, secrets, scaling, storage, routing, or infrastructure resources changed.

Typical flow:

1. Change `ecsd_infra` code.
2. Build and validate the infra project.
3. Preview the stack changes.
4. Apply the stack changes.
5. Re-run targeted smoke checks.

Current commands:

```bash
cd ecsd_infra
npm run build
npm run preview
npm run up
```

If additional setup is needed for Pulumi backend login or stack selection, use [ecsd_infra/README.md](../ecsd_infra/README.md).

## Infra Follow-Up Tickets

These are the infrastructure updates that should still be made. Priority is operational priority. Cost is expected ongoing cloud-cost impact, not implementation effort.

| Ticket | Priority | Cost | Summary |
| --- | --- | --- | --- |
| Harden MongoDB backups and restore runbook | P0 | Medium | Add scheduled backups, test restore, and document recovery. |
| Private backend invocation hardening | P0 | Low | Limit direct backend exposure so only intended entrypoints are reachable. |
| CI/CD pipeline for builds and deploys | P1 | Low | Automate image build, push, and rollout. |
| Structured monitoring and alerting | P1 | Low | Add uptime checks, alerting, and baseline dashboards. |
| Staging environment | P1 | Medium | Add a separate pre-production environment using the same model. |
| Secret rotation runbook | P2 | Low | Document safe rotation for JWT, DB, mail, and AI secrets. |
| Artifact and image retention policy | P2 | Low | Define cleanup and retention for old images and artifacts. |
| Scheduler hardening | P2 | Low | Confirm runtime expectations, retry behavior, and operational ownership. |
| MongoDB high-availability upgrade path | P2 | High | Move beyond the cheapest topology when uptime requirements justify it. |
| CDN/static asset optimization | P3 | Medium | Improve console asset delivery if traffic or performance warrants it. |

## Scope Rules

This document should not be used for:

- documenting rejected deployment options
- preserving decision history
- reproducing the Pulumi implementation file-by-file
- speculative future designs with no planned execution path

Future-oriented content belongs here only when it is an actionable follow-up.
