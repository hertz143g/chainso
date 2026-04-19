# VPS deploy

This setup is intentionally simple and portable:

- `Dockerfile` builds the Next.js standalone server.
- `compose.prod.yml` runs the app and Caddy.
- Caddy terminates HTTPS automatically for `APP_DOMAINS`.
- User media and database are not local yet; when backend lands, use S3-compatible storage and Postgres migrations.

## 1. Point DNS

Create DNS records for the domain you want to open:

```txt
A     chainso.app       <VPS_IP>
A     www.chainso.app   <VPS_IP>
```

If Cloudflare proxy is enabled, set SSL/TLS mode to `Full` or `Full (strict)`.

## 2. Install Docker on a fresh Ubuntu VPS

```bash
ssh root@<VPS_IP> 'bash -s' < infra/scripts/bootstrap-ubuntu-docker.sh
```

## 3. First deploy

```bash
VPS_HOST=<VPS_IP> VPS_USER=root APP_DOMAINS="chainso.app,www.chainso.app" ./scripts/deploy-vps.sh
```

If `APP_DOMAINS` is passed, the script creates `/opt/chainso/infra/env/production.env`
automatically. If not, the first deploy creates a template and stops. You can edit it on the server:

```bash
ssh root@<VPS_IP>
nano /opt/chainso/infra/env/production.env
```

Example:

```txt
COMPOSE_PROJECT_NAME=chainso
APP_DOMAINS='chainso.app www.chainso.app'
```

Then rerun:

```bash
VPS_HOST=<VPS_IP> VPS_USER=root DEPLOY_PATH=/opt/chainso ./scripts/deploy-vps.sh
```

## Useful commands

```bash
cd /opt/chainso
set -a && . infra/env/production.env && set +a
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml logs -f app
docker compose -f compose.prod.yml logs -f caddy
docker compose -f compose.prod.yml pull
docker compose -f compose.prod.yml up -d --build --remove-orphans
```
