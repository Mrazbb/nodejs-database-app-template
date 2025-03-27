#!/bin/bash

# Source environment variables
source .env

# Check required environment variables
: "${postgres_password:?Variable not set or empty}"
: "${postgres_user:?Variable not set or empty}"
: "${postgres_db:?Variable not set or empty}"
: "${docker_container_pg:?Variable not set or empty}"

COMMAND=$1
FILE=${2:-backup.sql}

case "$COMMAND" in
  backup)
    echo "Starting backup to file: $FILE..."

    docker exec -e PGPASSWORD="$postgres_password" -t "$docker_container_pg" pg_dump -U "$postgres_user" -d "$postgres_db" --no-acl > "$FILE" || { echo "Backup failed."; exit 1; }

    echo "Backup completed successfully: $FILE"
    ;;

  restore)
    if [ ! -f "$FILE" ]; then
      echo "Backup file not found: $FILE"
      exit 1
    fi

    echo "Starting restore from file: $FILE..."

    docker exec -i "$docker_container_pg" /bin/bash -c "PGPASSWORD='$postgres_password' psql --username='$postgres_user' '$postgres_db'" < "$FILE" || { echo "Restore failed."; exit 1; }

    echo "Restore completed successfully from: $FILE"
    ;;

  *)
    echo "Usage: $0 {backup|restore} [filename.sql]"
    exit 1
    ;;
esac
