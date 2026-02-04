#!/bin/bash
set -eo pipefail

# https://docs.localstack.cloud/references/init-hooks/

SEPARATOR='----------------------------------------------------------------------------'
ENDPOINT_URL="http://localhost:4566"
BACKUP_FILE="/var/lib/localstack/backup/secret-${SECRET_MANAGER_APP_CONFIG_PATH//\//-}.json"


echo -e "\n"

echo $SEPARATOR
echo -e "Running AWS create secret command for ${SECRET_MANAGER_APP_CONFIG_PATH}.\n"
aws secretsmanager create-secret --region ${AWS_DEFAULT_REGION} --endpoint-url=${ENDPOINT_URL} --name ${SECRET_MANAGER_APP_CONFIG_PATH}
echo -e "\nCreated ${SECRET_MANAGER_APP_CONFIG_PATH}"

# Restore secret from backup file
if [ -f "${BACKUP_FILE}" ]; then
  echo -e "Running AWS set secret value command for ${SECRET_MANAGER_APP_CONFIG_PATH}\n"
  SECRET_VALUE=$(cat "${BACKUP_FILE}")
  aws secretsmanager put-secret-value \
    --region "${AWS_DEFAULT_REGION}" \
    --endpoint-url="${ENDPOINT_URL}" \
    --secret-id "${SECRET_MANAGER_APP_CONFIG_PATH}" \
    --secret-string "${SECRET_VALUE}"
  echo -e "\nRestored ${SECRET_MANAGER_APP_CONFIG_PATH}"
fi

echo $SEPARATOR
