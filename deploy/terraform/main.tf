################################################################################
# Terraform — GCP infrastructure for Config MKPT
# Creates: VPC, GCE instance (with static external IP), Artifact Registry,
#          firewall rules, Cloud Build trigger, Cloud DNS zone + A record
#          for db.<domain_name>.
#
# Usage:
#   cd deploy/terraform
#   cp terraform.tfvars.example terraform.tfvars   # fill in values
#   terraform init
#   terraform apply
################################################################################

terraform {
  required_version = ">= 1.7"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# ── Variables ─────────────────────────────────────────────────────────────────

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  default = "us-central1"
}

variable "zone" {
  default = "us-central1-a"
}

variable "instance_machine_type" {
  default = "e2-standard-2"
}

variable "github_owner" {
  description = "GitHub organisation or user that owns the repo"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "config_mkpt"
}

variable "domain_name" {
  description = "Base domain name (e.g. example.com). PocketBase will be served at db.<domain_name>."
  type        = string
}

variable "create_dns_zone" {
  description = "Set to true to create a Cloud DNS managed zone for domain_name. Set to false if you manage DNS elsewhere — the static IP will still be output for manual A record creation."
  type        = bool
  default     = true
}

# ── Provider ──────────────────────────────────────────────────────────────────

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── Artifact Registry ─────────────────────────────────────────────────────────

resource "google_artifact_registry_repository" "app" {
  repository_id = "config-mkpt"
  format        = "DOCKER"
  location      = var.region
  description   = "Docker images for Config MKPT"
}

# ── VPC network ───────────────────────────────────────────────────────────────

resource "google_compute_network" "vpc" {
  name                    = "config-mkpt-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "config-mkpt-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# ── Firewall ──────────────────────────────────────────────────────────────────

resource "google_compute_firewall" "allow_http_https" {
  name    = "config-mkpt-allow-http-https"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["config-mkpt"]
}

resource "google_compute_firewall" "allow_iap_ssh" {
  name    = "config-mkpt-allow-iap-ssh"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # IAP source range
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["config-mkpt"]
}

# ── Static external IP ────────────────────────────────────────────────────────
# A stable IP that survives VM restarts and re-creates.
# Point your DNS A record:  db.<domain_name>  →  <static_ip output>

resource "google_compute_address" "static_ip" {
  name         = "config-mkpt-ip"
  region       = var.region
  address_type = "EXTERNAL"
  description  = "Static external IP for the Config MKPT GCE instance"
}

# ── Service Account for GCE ───────────────────────────────────────────────────

resource "google_service_account" "gce_sa" {
  account_id   = "config-mkpt-gce"
  display_name = "Config MKPT GCE Service Account"
}

resource "google_project_iam_member" "gce_ar_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.gce_sa.email}"
}

resource "google_project_iam_member" "gce_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gce_sa.email}"
}

# ── GCE Instance ──────────────────────────────────────────────────────────────

resource "google_compute_instance" "app" {
  name         = "config-mkpt-vm"
  machine_type = var.instance_machine_type
  zone         = var.zone
  tags         = ["config-mkpt"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 50
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.subnet.id

    # Attach the static external IP so the VM is reachable from the internet
    # and db.<domain_name> DNS resolves to a stable address.
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  service_account {
    email  = google_service_account.gce_sa.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    startup-script = file("${path.module}/../gce-startup.sh")
  }

  allow_stopping_for_update = true
}

# ── Cloud NAT (outbound for private subnets) ──────────────────────────────────

resource "google_compute_router" "router" {
  name    = "config-mkpt-router"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "config-mkpt-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# ── Cloud DNS ─────────────────────────────────────────────────────────────────
# Creates a managed zone for <domain_name> and an A record: db.<domain_name>.
#
# If create_dns_zone = false these resources are skipped; point your existing
# DNS provider's A record to the static_ip output instead.

resource "google_dns_managed_zone" "main" {
  count       = var.create_dns_zone ? 1 : 0
  name        = "config-mkpt-zone"
  dns_name    = "${var.domain_name}."
  description = "Managed zone for ${var.domain_name}"
  visibility  = "public"
}

resource "google_dns_record_set" "db" {
  count        = var.create_dns_zone ? 1 : 0
  name         = "db.${var.domain_name}."
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.main[0].name
  rrdatas      = [google_compute_address.static_ip.address]
}

# ── Cloud Build trigger ───────────────────────────────────────────────────────

resource "google_cloudbuild_trigger" "main" {
  name     = "config-mkpt-deploy"
  filename = "deploy/cloudbuild.yaml"

  github {
    owner = var.github_owner
    name  = var.github_repo

    push {
      branch = "^main$"
    }
  }

  substitutions = {
    _REGION        = var.region
    _INSTANCE_ZONE = var.zone
    _INSTANCE_NAME = google_compute_instance.app.name
    _AR_REPO       = google_artifact_registry_repository.app.repository_id
  }
}

# ── Outputs ───────────────────────────────────────────────────────────────────

output "instance_name" {
  value = google_compute_instance.app.name
}

output "static_ip" {
  description = "Static external IP — DNS A record:  db.<domain_name>  →  <this value>"
  value       = google_compute_address.static_ip.address
}

output "pocketbase_url" {
  description = "PocketBase URL after DNS propagation and TLS certificate setup"
  value       = "https://db.${var.domain_name}"
}

output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}

output "dns_name_servers" {
  description = "If create_dns_zone = true, update your domain registrar to use these name servers"
  value       = var.create_dns_zone ? google_dns_managed_zone.main[0].name_servers : []
}
