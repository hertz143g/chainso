#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:?Set VPS_HOST, for example VPS_HOST=2.26.28.68}"
VPS_USER="${VPS_USER:-deploy}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/chainso-proxy}"
PROXY_PROJECT_NAME="${PROXY_PROJECT_NAME:-chainso-proxy}"
EDGE_NETWORK="${EDGE_NETWORK:-chainso_edge}"
PROD_DOMAINS_NORMALIZED="${PROD_DOMAINS:-chainso.ru,golover.chainso.ru,lover.chainso.ru}"
PROD_DOMAINS_NORMALIZED="${PROD_DOMAINS_NORMALIZED//,/ }"
STAGING_DOMAINS_NORMALIZED="${STAGING_DOMAINS:-staging.chainso.ru}"
STAGING_DOMAINS_NORMALIZED="${STAGING_DOMAINS_NORMALIZED//,/ }"
PROD_UPSTREAM="${PROD_UPSTREAM:-chainso-prod-app:3000}"
STAGING_UPSTREAM="${STAGING_UPSTREAM:-chainso-staging-app:3000}"
ENV_FILE="${ENV_FILE:-infra/env/proxy.env}"
REMOTE="${VPS_USER}@${VPS_HOST}"

echo "Deploying Chainso proxy to ${REMOTE}:${DEPLOY_PATH}"

ssh "${REMOTE}" "mkdir -p '${DEPLOY_PATH}/infra/env' '${DEPLOY_PATH}/infra/caddy'"

rsync -az \
  compose.proxy.yml \
  "${REMOTE}:${DEPLOY_PATH}/compose.proxy.yml"

rsync -az \
  infra/caddy/Caddyfile \
  "${REMOTE}:${DEPLOY_PATH}/infra/caddy/Caddyfile"

ssh "${REMOTE}" "cd '${DEPLOY_PATH}' && \
  if ! docker compose version >/dev/null 2>&1; then \
    echo 'Docker Compose is not installed on the VPS.'; \
    exit 3; \
  fi && \
  printf '%s\n' \
    'PROXY_PROJECT_NAME=${PROXY_PROJECT_NAME}' \
    'EDGE_NETWORK=${EDGE_NETWORK}' \
    \"PROD_DOMAINS='${PROD_DOMAINS_NORMALIZED}'\" \
    'PROD_UPSTREAM=${PROD_UPSTREAM}' \
    \"STAGING_DOMAINS='${STAGING_DOMAINS_NORMALIZED}'\" \
    'STAGING_UPSTREAM=${STAGING_UPSTREAM}' \
    > '${ENV_FILE}' && \
  docker network inspect '${EDGE_NETWORK}' >/dev/null 2>&1 || docker network create '${EDGE_NETWORK}' >/dev/null && \
  docker compose --env-file '${ENV_FILE}' -f compose.proxy.yml up -d --remove-orphans && \
  docker compose --env-file '${ENV_FILE}' -f compose.proxy.yml ps"
