#!/bin/bash

source .env

CONTAINER_NAME=${COMPOSE_PROJECT_NAME}_$1

# default to app
if [ -z "$1" ]; then
  CONTAINER_NAME=${COMPOSE_PROJECT_NAME}_app
fi

docker logs --tail 4000 -f "$CONTAINER_NAME"