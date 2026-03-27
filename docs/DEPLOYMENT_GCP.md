# Google Cloud Platform Deployment Guide

This guide covers deploying ClawHost to Google Cloud Platform using Cloud Run and Cloud SQL.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────────────────────┐  │
│  │  Cloud Run   │────────▶│  Cloud SQL (PostgreSQL 15)  │  │
│  │  (Next.js)   │         │  via Unix Socket             │  │
│  └──────────────┘         └──────────────────────────────┘  │
│         │                                                    │
│         │                 ┌──────────────────────────────┐  │
│         └────────────────▶│  Artifact Registry           │  │
│                           │  (Docker Images)             │  │
│                           └──────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- Docker installed locally
- Node.js 18+

## Quick Deploy

### 1. Install and Configure gcloud

```bash
# Install gcloud CLI
curl -fsSL https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz -o /tmp/gcloud.tar.gz
tar -xzf /tmp/gcloud.tar.gz -C $HOME
$HOME/google-cloud-sdk/install.sh --quiet --path-update true

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region us-central1
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Create Cloud SQL Instance

```bash
# Create PostgreSQL instance (takes ~5 minutes)
gcloud sql instances create clawhost-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password="$(openssl rand -base64 24)" \
  --storage-size=10GB \
  --storage-auto-increase

# Create database and user
gcloud sql databases create clawhost --instance=clawhost-db

DB_PASSWORD=$(openssl rand -base64 24)
gcloud sql users create clawhost --instance=clawhost-db --password="$DB_PASSWORD"
echo "Save this password: $DB_PASSWORD"
```

### 4. Create Artifact Registry

```bash
gcloud artifacts repositories create clawhost \
  --repository-format=docker \
  --location=us-central1 \
  --description="ClawHost Docker images"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
```

### 5. Build and Push Docker Image

```bash
# Ensure public folder exists
mkdir -p public && touch public/.gitkeep

# Build image
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/clawhost/app:latest .

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/clawhost/app:latest
```

### 6. Deploy to Cloud Run

```bash
# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Get Cloud SQL connection name
INSTANCE_CONN=$(gcloud sql instances describe clawhost-db --format="value(connectionName)")

# Deploy
gcloud run deploy clawhost \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/clawhost/app:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --add-cloudsql-instances=$INSTANCE_CONN \
  --set-env-vars="DATABASE_URL=postgresql://clawhost:${DB_PASSWORD}@localhost/clawhost?host=/cloudsql/${INSTANCE_CONN}" \
  --set-env-vars="NEXTAUTH_SECRET=${NEXTAUTH_SECRET}" \
  --set-env-vars="NEXTAUTH_URL=https://YOUR_SERVICE_URL" \
  --set-env-vars="NODE_ENV=production" \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3
```

### 7. Run Database Migrations

```bash
# Authorize your IP for direct connection
MY_IP=$(curl -s ifconfig.me)
gcloud sql instances patch clawhost-db --authorized-networks="$MY_IP/32" --quiet

# Get Cloud SQL public IP
SQL_IP=$(gcloud sql instances describe clawhost-db --format="value(ipAddresses[0].ipAddress)")

# Run migrations
DATABASE_URL="postgresql://clawhost:${DB_PASSWORD}@${SQL_IP}:5432/clawhost" npx prisma migrate deploy
```

### 8. Update NEXTAUTH_URL

After deployment, update with the actual Cloud Run URL:

```bash
SERVICE_URL=$(gcloud run services describe clawhost --region=us-central1 --format="value(status.url)")

gcloud run services update clawhost \
  --region=us-central1 \
  --update-env-vars="NEXTAUTH_URL=${SERVICE_URL}"
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string with Cloud SQL socket | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes |
| `NEXTAUTH_URL` | Cloud Run service URL | Yes |
| `NODE_ENV` | Set to `production` | Yes |
| `STRIPE_SECRET_KEY` | Stripe API secret key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For payments |
| `STRIPE_PRICE_ID` | Stripe subscription price ID | For payments |

## Adding Stripe Configuration

```bash
gcloud run services update clawhost \
  --region=us-central1 \
  --update-env-vars="STRIPE_SECRET_KEY=sk_live_xxx" \
  --update-env-vars="STRIPE_WEBHOOK_SECRET=whsec_xxx" \
  --update-env-vars="STRIPE_PRICE_ID=price_xxx"
```

Set up Stripe webhook pointing to: `https://YOUR_SERVICE_URL/api/stripe/webhook`

## Updating the Application

```bash
# Rebuild and push new image
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/clawhost/app:latest .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/clawhost/app:latest

# Deploy new revision
gcloud run deploy clawhost \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/clawhost/app:latest \
  --region=us-central1
```

## Monitoring & Logs

```bash
# View logs
gcloud run services logs read clawhost --region=us-central1

# Stream logs
gcloud run services logs tail clawhost --region=us-central1

# View Cloud SQL logs
gcloud sql instances list
```

## Cost Estimates (Monthly)

| Resource | Tier | Estimated Cost |
|----------|------|----------------|
| Cloud Run | 512Mi, scale to 0 | ~$0-10 (pay per use) |
| Cloud SQL | db-f1-micro | ~$10-15 |
| Artifact Registry | Storage | ~$1-2 |
| **Total** | | **~$15-30/month** |

## Cleanup

To delete all resources:

```bash
# Delete Cloud Run service
gcloud run services delete clawhost --region=us-central1 --quiet

# Delete Cloud SQL instance
gcloud sql instances delete clawhost-db --quiet

# Delete Artifact Registry
gcloud artifacts repositories delete clawhost --location=us-central1 --quiet
```

## Troubleshooting

### Connection to Cloud SQL fails
- Ensure Cloud SQL instance is running: `gcloud sql instances list`
- Check Cloud Run has the Cloud SQL connection: `--add-cloudsql-instances` flag
- Verify DATABASE_URL uses Unix socket path for Cloud Run

### Migrations fail
- Authorize your IP: `gcloud sql instances patch clawhost-db --authorized-networks="YOUR_IP/32"`
- Use public IP for local migrations, Unix socket for Cloud Run

### Cold start latency
- Set `--min-instances=1` to keep one instance warm (increases cost)
- Optimize Docker image size

## Current Deployment

- **Project:** clawdbot-nickdevmtl
- **Region:** us-central1
- **Service URL:** https://clawhost-794442866411.us-central1.run.app
- **Cloud SQL Instance:** clawhost-db (35.225.217.179)
- **Database:** clawhost
- **User:** clawhost
