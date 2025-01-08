#!/bin/bash

source ../.env
docker logs --tail 2000 -f $docker_container_app 