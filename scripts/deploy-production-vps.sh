#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:?Set VPS_HOST, for example VPS_HOST=2.26.28.68}" \
VPS_USER="${VPS_USER:-deploy}" \
DEPLOY_PATH="${DEPLOY_PATH:-/opt/chainso}" \
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-chainso}" \
APP_NETWORK_ALIAS="${APP_NETWORK_ALIAS:-chainso-prod-app}" \
ENV_FILE="${ENV_FILE:-infra/env/production.env}" \
DATABASE_ENV_FILE="${DATABASE_ENV_FILE:-infra/env/database.env}" \
EDGE_NETWORK="${EDGE_NETWORK:-chainso_edge}" \
"$(dirname "$0")/deploy-vps.sh"
