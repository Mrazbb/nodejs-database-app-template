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

echo "Removing Docker images from: $BACKUP_DIR"
echo "---"

# --- Remove Execution ---

# remove all images from the data/images directory
rm -rf data/images/*

echo "---"
echo "Images removed!"