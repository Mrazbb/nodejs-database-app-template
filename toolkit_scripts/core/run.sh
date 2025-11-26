#!/bin/bash
# This script is executed from the project root, so paths are relative to it.
echo "Starting up the application..."
docker compose up -d --build --remove-orphans
echo "Application is running."