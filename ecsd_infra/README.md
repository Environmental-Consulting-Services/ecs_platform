# ECSD Infra

This directory contains the Pulumi project for the ECSD GCP environment.

Its scope is intentionally limited to the infra project itself:

- project layout
- prerequisites for working on infra code
- local infra development workflow
- preview/apply commands
- infra-specific validation

Platform-wide deployment guidance belongs in [docs/deployment.md](../docs/deployment.md).

## Project Layout

Key files:

- `index.ts`: root stack composition
- `Pulumi.yaml`: Pulumi project definition
- `Pulumi.prod.yaml`: production stack config
- `package.json`: infra scripts and dependencies
- `scripts/build-and-push-images.sh`: image build/push helper used by the infra workflow

Main modules under `src/`:

- `config.ts`: typed stack config and normalization
- `types.ts`: shared config and service types
- `naming.ts`: naming helpers and conventions
- `project-services.ts`: GCP API enablement and project service prerequisites
- `artifact-registry.ts`: Artifact Registry resources
- `iam.ts`: runtime identities and IAM bindings
- `secrets.ts`: Secret Manager resources and access grants
- `state-backend.ts`: Pulumi state bucket bootstrap/import logic
- `networking.ts`: VPC and subnet prerequisites
- `mongo.ts`: self-managed MongoDB resources
- `cloud-run.ts`: Cloud Run service definitions
- `domain-mapping.ts`: Cloud Run domain mapping resources
- `monitoring.ts`: monitoring placeholders
- `load-balancer.ts`: deferred load balancer component
- `storage.ts`: storage-related infrastructure helpers

## Prerequisites

- Node.js 20+
- Pulumi CLI
- `gcloud` CLI
- access to the target GCP project

Install dependencies:

```bash
cd ecsd_infra
npm install
```

## Pulumi Workflow

Select or create the production stack:

```bash
cd ecsd_infra
pulumi stack select prod || pulumi stack init prod
```

Set base config as needed:

```bash
pulumi config set gcp:project smartcomplai
pulumi config set gcp:region us-central1
```

Build and validate the TypeScript project:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Apply:

```bash
npm run up
```

## State Backend Notes

This project uses a GCS-backed Pulumi state flow.

If you are using the target bucket as the Pulumi backend, the bucket must exist before `pulumi login gs://...` can succeed.

The project includes `PulumiStateBootstrapBucket` support for importing the existing bucket by default. Use that only as part of the infra project workflow; do not duplicate backend bootstrap guidance in the top-level deployment docs.

## Image Build Helper

`scripts/build-and-push-images.sh` is part of the infra project because it matches the image names and registry layout expected by the Cloud Run resources in this directory.

Run it through the package script:

```bash
cd ecsd_infra
npm run images:push
```

That workflow is documented from a platform perspective in [docs/docker.md](../docs/docker.md). This README only notes that the script lives here and is part of the infra project tooling.

## Infra Project Operational Commands

Common commands tied directly to this project:

App image build and push:

```bash
cd ecsd_infra
npm run images:push
```

Preview:

```bash
cd ecsd_infra
npm run preview
```

Apply:

```bash
cd ecsd_infra
npm run up
```

If the API baseline bootstrap code or seed expectations changed, run the job created by this project after the API image and stack are current:

```bash
gcloud run jobs execute prod-baseline-bootstrap \
  --region us-central1 \
  --project smartcomplai \
  --wait
```

## Validation

Minimum validation for infra changes:

```bash
cd ecsd_infra
npm run build
npm run preview
```

Add service-level smoke checks after `pulumi up` from the top-level deployment workflow.
