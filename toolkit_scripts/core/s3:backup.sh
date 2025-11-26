#!/bin/bash
# source the backup.env
source .env
source .env.backup

PROJECT_ROOT=$(pwd)
LOG_FILE="/var/log/docker_backup.log"
S3_BUCKET="$s3_bucket_name"
S3_PATH="$s3_path" # A sub-folder within your bucket
S3_ACCESS_KEY="$s3_access_key_id"
S3_SECRET_KEY="$s3_secret_access_key"
S3_REGION="$s3_region"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILENAME="${COMPOSE_PROJECT_NAME}-backup-${TIMESTAMP}.tar.gz"


# Exit on any error and handle pipeline failures
set -e
set -o pipefail

# Redirect all output to a log file and the console
exec &> >(tee -a "$LOG_FILE")

echo "========================================="
echo "Starting backup at $(date)"
echo "========================================="

# --- Main Script ---
# ... (your backup logic: docker-compose down, tar, etc.)
echo "Creating backup archive: /tmp/${BACKUP_FILENAME}"
tar czf "/tmp/${BACKUP_FILENAME}" -C "${PROJECT_ROOT}" .
echo "Backup archive created: /tmp/${BACKUP_FILENAME}"

# --- Retention Tagging Logic ---
# Determine the day of the week (1=Mon, ..., 7=Sun)
DAY_OF_WEEK=$(date +%u)
RETENTION_TAG=""

if [ "$DAY_OF_WEEK" -eq 7 ]; then
  # It's Sunday, tag this as a weekly backup
  echo "This is a Sunday. Tagging backup as 'Weekly'."
  RETENTION_TAG="Retention=Weekly"
else
  # It's any other day, tag this as a daily backup
  echo "Tagging backup as 'Daily'."
  RETENTION_TAG="Retention=Daily"
fi
# use s3 credentials from the backup.env
aws configure set aws_access_key_id "$s3_access_key_id"
aws configure set aws_secret_access_key "$s3_secret_access_key"
aws configure set region "$s3_region"

# --- Upload and Tag ---
echo "Uploading backup to S3..."
FULL_S3_PATH="s3://${S3_BUCKET}/${S3_PATH}/${BACKUP_FILENAME}"

if aws s3 cp "/tmp/${BACKUP_FILENAME}" "${FULL_S3_PATH}"; then
  echo "SUCCESS: Backup uploaded successfully to S3."
  
  echo "Applying tag: ${RETENTION_TAG}..."
  if aws s3api put-object-tagging --bucket "${S3_BUCKET}" --key "${S3_PATH}/${BACKUP_FILENAME}" --tagging "TagSet=[{Key=Retention,Value=${RETENTION_TAG#*=}}]"; then
    echo "SUCCESS: Tag applied successfully."
  else
    echo "ERROR: Failed to apply tag to the S3 object." >&2
    # Optional: Decide if you want to delete the untagged object
    # aws s3 rm "${FULL_S3_PATH}"
    exit 1
  fi
else
  echo "ERROR: Failed to upload backup to S3." >&2
  # ... (your cleanup logic for failed upload)
  rm "/tmp/${BACKUP_FILENAME}"
  exit 1
fi

# --- Final Cleanup ---
# S3 will handle deletion, so we only clean up local files.
# ... (your cleanup logic: docker-compose up, rm temporary files)
rm "/tmp/${BACKUP_FILENAME}"

echo "Backup process finished successfully at $(date)."