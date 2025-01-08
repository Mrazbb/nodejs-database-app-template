#!/bin/bash
source ../.env

docker exec $docker_container_app /bin/sh -c 'cd /opt/app/ &&  npx pg-altergen generate && npx pg-altergen migrate'

echo "run script executed"