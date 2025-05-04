#!/bin/bash

# Source environment variables
source .env

# Check required environment variables
: "${postgres_password:?Variable not set or empty}"
: "${postgres_user:?Variable not set or empty}"
: "${postgres_db:?Variable not set or empty}"
: "${docker_container_pg:?Variable not set or empty}"
: "${postgres_external_port:?Variable not set or empty}"


COMMAND=$1
FILE=${2:-data/sql/backup.sql}

# Create directory for the backup file if it doesn't exist
DIR=$(dirname "$FILE")
mkdir -p "$DIR"

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


  connect)
    # env dev stage prod (gray, blue, green) in hex
    case "$environment" in
      dev)
        COLOR="cbcbcb"
        ;;
      stage)
        COLOR="000fff"
        ;;
      prod)
        COLOR="ff0000"
        ;;
      *)
        COLOR="cbcbcb"
        ;;
    esac

    LINK="postgresql+ssh://@$SSH_HOST_NAME/$postgres_user:$postgres_password@localhost:$postgres_external_port/$postgres_db?statusColor=$COLOR&env=$environment&name=$COMPOSE_PROJECT_NAME+$environment&tLSMode=0&usePrivateKey=true&safeModeLevel=0&advancedSafeModeLevel=0&driverVersion=0&lazyload=true"
    echo -e "\n\n$LINK\n\n"
    echo -e "open -a TablePlus \"$LINK\" \n\n"
    ;;

  *)
    echo "Usage: $0 {backup|restore|connect} [filename.sql]"
    exit 1
    ;;
esac
