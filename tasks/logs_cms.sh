#!/bin/bash

source .env

docker logs --tail 4000 -f $docker_container_app