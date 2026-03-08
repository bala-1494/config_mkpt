#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# init-ssl.sh — first-time Let's Encrypt certificate setup
#
# Run this ONCE on the GCE VM before starting the production stack.
#
# Prerequisites:
#   1. DNS A record  db.<DOMAIN_NAME>  →  <this server's static IP>  is live
#   2. Port 80 is reachable from the internet (firewall rule exists)
#   3. A .env file in the repo root contains DOMAIN_NAME and CERTBOT_EMAIL
#      (copy .env.example and fill in the values)
#
# Usage:
#   chmod +x deploy/nginx/init-ssl.sh
#   ./deploy/nginx/init-ssl.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load env vars from repo root .env
if [[ -f "${REPO_ROOT}/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${REPO_ROOT}/.env"
    set +a
fi

DOMAIN="${DOMAIN_NAME:?Set DOMAIN_NAME in .env or export it}"
EMAIL="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in .env or export it}"
SUBDOMAIN="db.${DOMAIN}"

echo "==> Requesting TLS certificate for ${SUBDOMAIN}"
echo "    Email: ${EMAIL}"

# certbot standalone binds port 80 directly — make sure nothing else is.
# If the prod stack is already partially up, stop nginx-proxy first.
docker compose \
    -f "${REPO_ROOT}/docker-compose.yml" \
    -f "${REPO_ROOT}/docker-compose.prod.yml" \
    stop nginx-proxy 2>/dev/null || true

# Use certbot standalone mode for the initial certificate.
# Named volumes (certbot-certs, certbot-www) must already exist.
docker run --rm \
    -p 80:80 \
    -v certbot-certs:/etc/letsencrypt \
    -v certbot-www:/var/www/certbot \
    certbot/certbot certonly \
        --standalone \
        --non-interactive \
        --email "${EMAIL}" \
        --agree-tos \
        --no-eff-email \
        --domains "${SUBDOMAIN}"

echo "==> Certificate issued. Starting the full production stack..."

docker compose \
    -f "${REPO_ROOT}/docker-compose.yml" \
    -f "${REPO_ROOT}/docker-compose.prod.yml" \
    up -d --remove-orphans

echo ""
echo "==> Done. PocketBase is available at https://${SUBDOMAIN}"
echo "    Admin UI: https://${SUBDOMAIN}/_/"
