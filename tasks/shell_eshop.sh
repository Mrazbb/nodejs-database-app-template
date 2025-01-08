#!/bin/bash
source .env

container_name="${COMPOSE_PROJECT_NAME}-eshop-1"

docker exec -it $docker_container_eshop bash