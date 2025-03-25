#!/bin/bash

source .env

POSTGRES_NETWORK=${COMPOSE_PROJECT_NAME}_postgres-net

if [ -z "$1" ]; then
  echo "Usage: ./altergen_run.sh [generate|migrate]"
  exit 1
fi

docker run --rm -it   \
    --network=$POSTGRES_NETWORK    \
    -v $(pwd)/altergen.json:/opt/app/altergen.json    \
    -v $(pwd)/sql:/opt/app/sql    \
    altergen-image   \
    "pg-altergen $1"