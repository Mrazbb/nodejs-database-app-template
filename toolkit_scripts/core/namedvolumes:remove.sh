#!/bin/bash
set -e

# Load environment variables from .env file
if [ -f .env ]; then
  source .env
fi

# Ensure COMPOSE_PROJECT_NAME is set, or exit with an error.
if [ -z "$COMPOSE_PROJECT_NAME" ]; then
  echo "Error: COMPOSE_PROJECT_NAME environment variable is not set."
  echo "Please set it before running the script. e.g., export COMPOSE_PROJECT_NAME=myproject"
  exit 1
fi

echo "Backing up named volumes for project: $COMPOSE_PROJECT_NAME"

# --- Backup Execution ---
BACKUP_DIR="data/namedvolumes"
mkdir -p "$BACKUP_DIR"

# remove all named volumes from the data/namedvolumes directory
rm -rf data/namedvolumes/*

echo "---"
echo "Named volumes removed!"
