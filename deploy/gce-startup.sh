#!/usr/bin/env bash
# GCE instance startup script
# Attach this under "Management > Startup script" in the GCE console,
# or pass via --metadata-from-file startup-script=deploy/gce-startup.sh
#
# Installs Docker, Compose v2, configures the app directory,
# and sets up systemd to keep the stack running on reboot.

set -euo pipefail

### ── Packages ─────────────────────────────────────────────────────────────────
apt-get update -qq
apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg lsb-release git

### ── Docker ────────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" \
      > /etc/apt/sources.list.d/docker.list

    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
fi

### ── Artifact Registry auth ───────────────────────────────────────────────────
# Uses the VM's service account — ensure the SA has roles/artifactregistry.reader
gcloud auth configure-docker "${REGION:-us-central1}-docker.pkg.dev" --quiet

### ── App directory ─────────────────────────────────────────────────────────────
APP_DIR=/opt/config-mkpt
mkdir -p "$APP_DIR"

# Pull docker-compose files from the repo (or mount via GCS / Secret Manager)
if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
    gsutil cp gs://"${GCS_CONFIG_BUCKET:-config-mkpt-config}"/* "$APP_DIR/" || true
fi

### ── Systemd service ───────────────────────────────────────────────────────────
cat > /etc/systemd/system/config-mkpt.service <<'UNIT'
[Unit]
Description=Config MKPT Docker Compose Stack
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/config-mkpt
ExecStart=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans
ExecStop=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now config-mkpt.service
