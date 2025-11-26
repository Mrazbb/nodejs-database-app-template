#!/bin/bash
set -e

# --- Restore Configuration ---
BACKUP_DIR="data/images"

# --- Pre-Restore Checks ---
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Error: Backup directory not found at '$BACKUP_DIR'"
  echo "There is nothing to restore."
  exit 1
fi

echo "Restoring Docker images from: $BACKUP_DIR"
echo "---"

# --- Restore Execution ---

# Find all gzipped tar archives in the backup directory.
FILES=$(find "$BACKUP_DIR" -type f -name "*.tar.gz")

if [ -z "$FILES" ]; then
  echo "No image backups (*.tar.gz) found in '$BACKUP_DIR'. Nothing to do."
  exit 0
fi


for FILE in $FILES; do
  echo "Restoring image from: $FILE"
  
  # Decompress the file and pipe the resulting tarball directly to 'docker load'.
  # This is efficient as it avoids saving the intermediate .tar file to disk.
  gunzip < "$FILE" | docker load
  
  echo "-> Successfully loaded image from $FILE"
done

echo "---"
echo "Image restore complete!"
echo "You can verify the images have been loaded with the 'docker images' command."