#!/bin/bash

# Source the environment variables
source .env


docker exec -i $docker_container_pg /bin/bash -c "PGPASSWORD=$postgres_password psql --username $postgres_user $postgres_db" < backup.sql

echo "run script executed"