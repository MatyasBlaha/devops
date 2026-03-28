#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-}"

if [[ -z "$ENV" ]]; then
  echo "Usage: ./scripts/deploy.sh <staging|production>"
  exit 1
fi

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "Error: environment must be 'staging' or 'production'"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/../k8s/$ENV"

echo "Deploying to $ENV..."

kubectl apply -k "$K8S_DIR"

echo "Waiting for deployment rollout..."
kubectl rollout status deployment/car-rental-app -n "car-rental-$ENV" --timeout=120s

echo "Deployment to $ENV complete."
