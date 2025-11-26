#!/bin/bash
source .env

CONTAINER_NAME=${COMPOSE_PROJECT_NAME}_$1

if [ -z "$1" ]; then
  CONTAINER_NAME=${COMPOSE_PROJECT_NAME}_app
fi

docker exec -it "$CONTAINER_NAME" bash