#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:?Set VPS_HOST, for example VPS_HOST=203.0.113.10}"
VPS_USER="${VPS_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/chainso}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-chainso}"
APP_NETWORK_ALIAS="${APP_NETWORK_ALIAS:-${COMPOSE_PROJECT_NAME}-app}"
EDGE_NETWORK="${EDGE_NETWORK:-chainso_edge}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
APP_DOMAINS_NORMALIZED="${APP_DOMAINS:-}"
APP_DOMAINS_NORMALIZED="${APP_DOMAINS_NORMALIZED//,/ }"
ENV_FILE="${ENV_FILE:-infra/env/production.env}"
DATABASE_ENV_FILE="${DATABASE_ENV_FILE:-infra/env/database.env}"
REMOTE="${VPS_USER}@${VPS_HOST}"

echo "Deploying Chainso to ${REMOTE}:${DEPLOY_PATH}"

ssh "${REMOTE}" "mkdir -p '${DEPLOY_PATH}/infra/env'"

rsync -az --delete \
  --exclude ".git" \
  --exclude ".next" \
  --exclude "node_modules" \
  --exclude ".env" \
  --exclude ".env.*" \
  --exclude "infra/env/*.env" \
  --exclude "infra/env/database.env" \
  --exclude "infra/env/production.env" \
  --exclude "infra/env/staging.env" \
  --exclude "infra/env/database.staging.env" \
  --exclude "infra/env/proxy.env" \
  ./ "${REMOTE}:${DEPLOY_PATH}/"

ssh "${REMOTE}" "cd '${DEPLOY_PATH}' && \
  if ! docker compose version >/dev/null 2>&1; then \
    echo 'Docker Compose is not installed on the VPS. Run infra/scripts/bootstrap-ubuntu-docker.sh first.'; \
    exit 3; \
  fi && \
  mkdir -p \"\$(dirname '${ENV_FILE}')\" && \
  printf '%s\n' \
    'COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME}' \
    'APP_NETWORK_ALIAS=${APP_NETWORK_ALIAS}' \
    'EDGE_NETWORK=${EDGE_NETWORK}' \
    'DATABASE_ENV_FILE=${DATABASE_ENV_FILE}' \
    \"APP_DOMAINS='${APP_DOMAINS_NORMALIZED}'\" \
    > '${ENV_FILE}' && \
  if [ ! -f '${DATABASE_ENV_FILE}' ]; then \
    echo 'Missing ${DEPLOY_PATH}/${DATABASE_ENV_FILE}. Create it before deploying the database-backed stack.'; \
    exit 4; \
  fi && \
  docker network inspect '${EDGE_NETWORK}' >/dev/null 2>&1 || docker network create '${EDGE_NETWORK}' >/dev/null && \
  set -a && . '${ENV_FILE}' && . '${DATABASE_ENV_FILE}' && set +a && \
  docker compose --env-file '${ENV_FILE}' -f compose.prod.yml up -d --build --remove-orphans && \
  if [ '${RUN_MIGRATIONS}' = '1' ]; then \
    docker compose --profile tools --env-file '${ENV_FILE}' -f compose.prod.yml build migrate && \
    docker compose --profile tools --env-file '${ENV_FILE}' -f compose.prod.yml run --rm migrate; \
  fi && \
  docker compose --env-file '${ENV_FILE}' -f compose.prod.yml ps"
