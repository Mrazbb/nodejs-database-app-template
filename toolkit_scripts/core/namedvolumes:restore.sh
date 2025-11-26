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

# Ensure a volume name was provided as an argument.
if [ -z "$1" ]; then
  echo "Error: No volume name supplied."
  echo "Usage: ./restore.sh <volume_name>"
  echo "Example: ./restore.sh ${COMPOSE_PROJECT_NAME}_db_data"
  exit 1
fi

VOLUME_TO_RESTORE=$1
BACKUP_DIR="data/namedvolumes"
BACKUP_FILE="${BACKUP_DIR}/${VOLUME_TO_RESTORE}.tar.gz"

echo "Attempting to restore volume: $VOLUME_TO_RESTORE"
echo "From backup file: $BACKUP_FILE"

# --- Pre-Restore Checks ---

# Check if the backup file actually exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found at $BACKUP_FILE"
  exit 1
fi

# --- DANGER ZONE ---
# Restoring a volume is a destructive operation.
# It involves stopping services and replacing the current volume entirely.

echo ""
echo "!!! WARNING !!!"
echo "This script will stop your Docker services and completely overwrite the volume '$VOLUME_TO_RESTORE'."
echo "Any data currently in that volume will be lost."
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled by user."
  exit 0
fi

# --- Restore Execution ---

echo "---"
echo "Stopping services to ensure data consistency..."
docker compose stop
echo "Services stopped."

echo "---"
echo "Restoring volume: $VOLUME_TO_RESTORE"

# Remove the existing volume if it exists. Ignore errors if it doesn't.
echo "Removing old volume if it exists..."
docker volume rm "$VOLUME_TO_RESTORE" > /dev/null 2>&1 || true
echo "Creating a new empty volume..."
docker volume create "$VOLUME_TO_RESTORE"

# Use a temporary Ubuntu container to extract the backup into the new volume
echo "Extracting backup data..."
docker run --rm \
  -v "${VOLUME_TO_RESTORE}:/volume_data" \
  -v "$(pwd)/$BACKUP_DIR:/backup" \
  ubuntu \
  tar xzf "/backup/${VOLUME_TO_RESTORE}.tar.gz" -C /volume_data

echo "-> Successfully restored data to volume: $VOLUME_TO_RESTORE"

echo "---"
echo "Restore complete!"
echo "You can now restart your services, for example: 'docker compose up -d'"