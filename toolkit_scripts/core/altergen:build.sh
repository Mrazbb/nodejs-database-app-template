#!/bin/bash

docker build -t altergen-image -f ./scripts/Dockerfile.altergen . --progress=plain --no-cache
