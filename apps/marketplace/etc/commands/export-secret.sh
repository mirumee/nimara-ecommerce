#!/bin/bash
set -eo pipefail

SEPARATOR='----------------------------------------------------------------------------'
ENDPOINT_URL="http://localhost:4566"
BACKUP_FILE="/var/lib/localstack/backup/secret-${SECRET_MANAGER_APP_CONFIG_PATH//\//-}.json"

echo -e "\n"

echo $SEPARATOR
echo -e "Running AWS export secret command for ${SECRET_MANAGER_APP_CONFIG_PATH}.\n"

mkdir -p /var/lib/localstack/backup

aws secretsmanager get-secret-value \
  --region "${AWS_DEFAULT_REGION}" \
  --endpoint-url="${ENDPOINT_URL}" \
  --secret-id "${SECRET_MANAGER_APP_CONFIG_PATH}" \
  --query SecretString \
  --output text > "${BACKUP_FILE}"

echo -e "\nExported ${SECRET_MANAGER_APP_CONFIG_PATH}"

echo $SEPARATOR
