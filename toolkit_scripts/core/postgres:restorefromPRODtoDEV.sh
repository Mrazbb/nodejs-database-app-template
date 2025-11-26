#!/bin/bash

source .env

# Check required environment variables
: "${postgres_password:?Variable not set or empty}"
: "${postgres_user:?Variable not set or empty}"
: "${postgres_db:?Variable not set or empty}"
: "${docker_container_pg:?Variable not set or empty}"
: "${postgres_external_port:?Variable not set or empty}"



# confirm

read -p "Are you sure you want to restore the postgres database from PROD to DEV? (y/n) and delete all data in the database? " confirm
if [ "$confirm" != "y" ]; then
  echo "Aborting..."
  exit 1
fi

# stop all containers
docker compose down 


# remove docker volume for postgres
docker volume rm ${COMPOSE_PROJECT_NAME}_postgres_data

# up postgres container
docker compose up -d postgres

echo "Waiting for PostgreSQL to start..."
sleep 5

# restore postgres database
toolkit_scripts/helpers/postgres.sh restore

# BEGIN;
# UPDATE localization.tbl_lang_country
# SET domainid = domainid || '_dev'
# WHERE domainid !~ '_dev$';
# COMMIT;
docker exec -e PGPASSWORD="$postgres_password" -t "$docker_container_pg" psql --username="$postgres_user" "$postgres_db" -c "BEGIN; UPDATE localization.tbl_lang_country SET domainid = domainid || '_dev' WHERE domainid !~ '_dev$'; COMMIT;"


# run all containers
docker compose up -d


# run altergen:run.sh
echo "Running altergen:generate and altergen:migrate..."
toolkit_scripts/core/altergen:run.sh generate && toolkit_scripts/core/altergen:run.sh migrate


# ### add _dev
# ```sql

# ```

# ```bash
# npm run up 
# docker compose up -d --build
# npm run altergen

# ```

