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

# Get a clean list of named volumes, skipping the header line.
# awk 'NR>1 {print $2}' processes the output starting from the second line.
VOLUMES=$(docker volume ls --filter "name=${COMPOSE_PROJECT_NAME}_" | awk 'NR>1 {print $2}')

if [ -z "$VOLUMES" ]; then
  echo "No named volumes found for project '$COMPOSE_PROJECT_NAME'. Nothing to do."
  exit 0
fi

echo "Found volumes to back up: $VOLUMES"
echo "---"

# IMPORTANT: For databases, it's safer to stop the container before a file-level backup.
# Uncomment the line below if you want the script to do this automatically.
# echo "Stopping containers to ensure data consistency..."

rm -rf data/namedvolumes/*

echo "Stopping containers to ensure data consistency..."
docker compose stop

for VOLUME in $VOLUMES; do
  echo "Backing up volume: $VOLUME"
  
  # Use a temporary Ubuntu container to create a compressed tar archive of the volume
  docker run --rm \
    -v "${VOLUME}:/volume_data" \
    -v "$(pwd)/$BACKUP_DIR:/backup" \
    ubuntu \
    tar czf "/backup/${VOLUME}.tar.gz" -C /volume_data .
    
  echo "-> Successfully backed up to: $BACKUP_DIR/${VOLUME}.tar.gz"
done

docker compose start 

echo "---"
echo "Backup complete!"
echo "All backup files are located in: $(pwd)/$BACKUP_DIR"```
