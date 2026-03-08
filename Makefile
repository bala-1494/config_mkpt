.PHONY: dev build push deploy tf-init tf-plan tf-apply

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

# SSH into GCE instance via IAP
ssh:
	gcloud compute ssh config-mkpt-vm --tunnel-through-iap --zone=us-central1-a
