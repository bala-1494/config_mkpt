#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# renew-ssl.sh — TLS certificate renewal (add to cron on the GCE VM)
#
# certbot renews certificates that expire within 30 days.
# After renewal nginx-proxy is reloaded so it picks up the new cert.
#
# Recommended cron (twice daily, staggered):
#   0 3,15 * * * /opt/config-mkpt/deploy/nginx/renew-ssl.sh >> /var/log/certbot-renew.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Renew using webroot (nginx-proxy must be running and serving port 80)
docker compose \
    -f "${REPO_ROOT}/docker-compose.yml" \
    -f "${REPO_ROOT}/docker-compose.prod.yml" \
    run --rm certbot renew \
        --webroot \
        --webroot-path=/var/www/certbot \
        --quiet

# Reload nginx so the new certificate takes effect without downtime
docker compose \
    -f "${REPO_ROOT}/docker-compose.yml" \
    -f "${REPO_ROOT}/docker-compose.prod.yml" \
    exec nginx-proxy nginx -s reload

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) — certificate renewal check complete"
