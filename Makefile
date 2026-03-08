.PHONY: dev build push deploy tf-init tf-plan tf-apply ssl-init ssl-renew prod-up

# ── Local development ─────────────────────────────────────────────────────────
dev:
	docker compose up --build

down:
	docker compose down

# ── Production build (local test) ─────────────────────────────────────────────
build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# ── GCP helpers ───────────────────────────────────────────────────────────────
tf-init:
	cd deploy/terraform && terraform init

tf-plan:
	cd deploy/terraform && terraform plan -var-file=terraform.tfvars

tf-apply:
	cd deploy/terraform && terraform apply -var-file=terraform.tfvars

# ── SSL / TLS ─────────────────────────────────────────────────────────────────
# Run once on the GCE VM after DNS A record for db.<DOMAIN_NAME> is live.
ssl-init:
	bash deploy/nginx/init-ssl.sh

# Check and renew certificates (add to cron: 0 3,15 * * * make -C /opt/config-mkpt ssl-renew)
ssl-renew:
	bash deploy/nginx/renew-ssl.sh

# ── Production ────────────────────────────────────────────────────────────────
prod-up:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# ── SSH into GCE instance via IAP ─────────────────────────────────────────────
ssh:
	gcloud compute ssh config-mkpt-vm --tunnel-through-iap --zone=us-central1-a
