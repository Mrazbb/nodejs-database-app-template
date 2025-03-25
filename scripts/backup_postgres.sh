#!/bin/bash

# Source the environment variables
source .env



docker exec -e PGPASSWORD=$postgres_password  -t $docker_container_pg pg_dump   -U $postgres_user -d $postgres_db  --no-acl > backup.sql

echo "run script executed"