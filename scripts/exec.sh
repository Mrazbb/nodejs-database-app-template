#!/bin/bash
source .env


CONTAINER_NAME=${COMPOSE_PROJECT_NAME}_$1

if [ -z "$1" ]; then
  echo "Usage: ./exec.sh [service_name]"
  exit 1
fi

docker exec -it "$CONTAINER_NAME" bash