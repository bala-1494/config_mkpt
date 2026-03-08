################################################################################
# Terraform — GCP infrastructure for Config MKPT
# Creates: VPC, GCE instance, Artifact Registry repo, firewall rules,
#          and a Cloud Build trigger.
#
# Usage:
#   cd deploy/terraform
#   terraform init
#   terraform apply -var="project_id=<YOUR_PROJECT>"
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
    # No external IP — use IAP for SSH and Cloud NAT for outbound
  }

  service_account {
    email  = google_service_account.gce_sa.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    startup-script = file("${path.module}/../gce-startup.sh")
  }

  metadata_startup_script = null  # using metadata key instead

  allow_stopping_for_update = true
}

# ── Cloud NAT (outbound internet for private VM) ──────────────────────────────
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

output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}
