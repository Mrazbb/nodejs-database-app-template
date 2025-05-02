#!/bin/bash

source .env

POSTGRES_NETWORK=${COMPOSE_PROJECT_NAME}_postgres-net

if [ -z "$1" ]; then
  echo "Usage: ./altergen_run.sh [generate|migrate]"
  exit 1
fi

# Ensure the output directories exist but files don't
mkdir -p $(dirname "${altergen_output_file}")
mkdir -p $(dirname "${altergen_drop_columns_file}")

# Make sure that if these paths exist, they are not directories
if [ -d "${altergen_output_file}" ]; then
  rm -rf "${altergen_output_file}"
fi

if [ -d "${altergen_drop_columns_file}" ]; then
  rm -rf "${altergen_drop_columns_file}"
fi

# Debug output
echo "Using output file: ${altergen_output_file}"
echo "Using drop columns file: ${altergen_drop_columns_file}"

docker run --rm -it   \
    --network=$POSTGRES_NETWORK    \
    -v $(pwd)/.env:/opt/app/.env    \
    -v $(pwd)/sql:/opt/app/sql    \
    -v $(pwd)/$(dirname "${altergen_output_file}"):/opt/app/$(dirname "${altergen_output_file}")   \
    -v $(pwd)/$(dirname "${altergen_drop_columns_file}"):/opt/app/$(dirname "${altergen_drop_columns_file}")   \
    altergen-image   \
    "pg-altergen $1 --output ${altergen_output_file} --drop-columns ${altergen_drop_columns_file}"



