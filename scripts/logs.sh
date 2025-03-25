#!/bin/bash

source .env

CONTAINER_NAME=${COMPOSE_PROJECT_NAME}_$1

if [ -z "$1" ]; then
  echo "Usage: ./logs.sh [service_name]"
  exit 1
fi

docker logs --tail 4000 -f "$CONTAINER_NAME"