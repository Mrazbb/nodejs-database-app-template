#!/bin/bash
source ../.env

docker exec $docker_container_app /bin/sh -c 'cd /opt/app/ &&  npm uninstall pg-altergen && npm cache clean --force && npm install pg-altergen && npm list pg-altergen'

echo "run script executed"