#!/bin/bash

echo "Initializing LocalStack..."

# Create Secrets Manager secret for app configuration
awslocal secretsmanager create-secret \
    --name "${SECRET_MANAGER_APP_CONFIG_PATH:-/marketplace/app-config}" \
    --secret-string '{}' \
    --region "${AWS_REGION:-ap-southeast-1}" \
    2>/dev/null || echo "Secret already exists"

echo "LocalStack initialization complete!"
