#!/bin/bash
set -e

# --- Backup Configuration ---
BACKUP_DIR="data/images"

echo "Backing up Docker images..."
mkdir -p "$BACKUP_DIR"

# --- Backup Execution ---

# Get a clean list of images used by the services in the docker compose.yml file.
# 'docker compose images' lists services and their corresponding images.
# 'awk 'NR>1 {print $2 ":" $3}' processes the output to get "IMAGE:TAG".
IMAGES=$(docker compose images | awk 'NR>1 {print $2 ":" $3}')

if [ -z "$IMAGES" ]; then
  echo "No images found for this project. Is Docker running?"
  exit 0
fi

echo "Found images to back up:"
echo "$IMAGES"
echo "---"

rm -rf data/images/*


for IMAGE in $IMAGES; do
  # Create a valid filename from the image name.
  # Replace ":" and "/" with underscores to avoid issues with file paths.
  FILENAME=$(echo "$IMAGE" | tr ':/' '_')
  BACKUP_FILE="${BACKUP_DIR}/${FILENAME}.tar"

  echo "Backing up image: $IMAGE"
  
  # Use 'docker save' to create a tarball of the image.
  docker save -o "$BACKUP_FILE" "$IMAGE"
  
  # Optional: Compress the tarball to save space.
  echo "-> Compressing to ${BACKUP_FILE}.gz"
  gzip -f "$BACKUP_FILE"
  
  echo "-> Successfully backed up to: ${BACKUP_FILE}.gz"
done


echo "---"
echo "Image backup complete!"
echo "All backup files are located in: $(pwd)/$BACKUP_DIR"