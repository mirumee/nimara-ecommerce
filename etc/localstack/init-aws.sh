#!/bin/bash
set -eo pipefail

# https://docs.localstack.cloud/references/init-hooks/
#
# Creates the queues named in `SQS_QUEUES`. A queue a dev server polls is
# created by the poller itself; name one here when it has to exist before
# anything reads it, such as a queue another app publishes to.

if [ -z "${SQS_QUEUES}" ]; then
  exit 0
fi

IFS=',' read -ra QUEUES <<< "${SQS_QUEUES}"

for queue in "${QUEUES[@]}"; do
  name="$(echo "${queue}" | xargs)"

  if [ -n "${name}" ]; then
    awslocal sqs create-queue --queue-name "${name}"
    echo "Created queue ${name}"
  fi
done
