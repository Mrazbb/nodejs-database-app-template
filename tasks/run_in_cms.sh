#!/bin/bash
source .env

docker exec $docker_container_app /bin/sh -c "$@"

echo "run script executed"