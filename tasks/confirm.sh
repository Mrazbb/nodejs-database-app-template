#!/usr/bin/env bash

# Usage: ./tasks/confirm.sh "Your question"
# Exits with code 0 (success) if user confirms with "y"
# Exits with code 1 (failure) otherwise

echo -n "$1 (y/n) "
read confirm

if [ "$confirm" = "y" ]; then
  exit 0
else
  echo "Cancelled"
  exit 1
fi 