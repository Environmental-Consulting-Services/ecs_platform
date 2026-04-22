#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-smartcomplai}"
REGION="${REGION:-us-central1}"
REPOSITORY="${REPOSITORY:-ecsd}"
SHA_TAG="${SHA_TAG:-$(git -C "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)" rev-parse --short HEAD)}"
ALIAS_TAG="${ALIAS_TAG:-prod}"
PLATFORM="${PLATFORM:-linux/amd64}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}"

usage() {
  cat <<EOF
Usage: $(basename "$0") [service ...]

Builds and pushes ECSD service images to Artifact Registry.

Environment overrides:
  PROJECT_ID   default: smartcomplai
  REGION       default: us-central1
  REPOSITORY   default: ecsd
  SHA_TAG      default: current git short SHA
  ALIAS_TAG    default: prod; set empty to skip alias tagging
  PLATFORM     default: linux/amd64

Services:
  console api expert mail scheduler

Prerequisites:
  gcloud auth login
  gcloud auth configure-docker ${REGION}-docker.pkg.dev
  Artifact Registry repository ${REPOSITORY} exists in ${PROJECT_ID}/${REGION}
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

services=("$@")
if [[ ${#services[@]} -eq 0 ]]; then
  services=(console api expert mail scheduler)
fi

dockerfile_for() {
  case "$1" in
    console) echo "ecsd_console/docker/Dockerfile" ;;
    api) echo "ecsd_api/docker/Dockerfile" ;;
    expert) echo "ecsd_expert/docker/Dockerfile" ;;
    mail) echo "ecsd_mail/docker/Dockerfile" ;;
    scheduler) echo "ecsd_scheduler/Dockerfile" ;;
    *)
      echo "Unknown service: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
}

context_for() {
  case "$1" in
    console) echo "ecsd_console" ;;
    api) echo "ecsd_api" ;;
    expert) echo "ecsd_expert" ;;
    mail) echo "ecsd_mail" ;;
    scheduler) echo "ecsd_scheduler" ;;
    *)
      echo "Unknown service: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
}

for service in "${services[@]}"; do
  dockerfile="$(dockerfile_for "$service")"
  context="$(context_for "$service")"
  sha_image="${REGISTRY}/${service}:${SHA_TAG}"
  tags=(--tag "${sha_image}")

  if [[ -n "${ALIAS_TAG}" ]]; then
    tags+=(--tag "${REGISTRY}/${service}:${ALIAS_TAG}")
  fi

  echo "Building and pushing ${sha_image}"
  docker buildx build \
    --platform "${PLATFORM}" \
    --file "${ROOT_DIR}/${dockerfile}" \
    "${tags[@]}" \
    --push \
    "${ROOT_DIR}/${context}"
done
