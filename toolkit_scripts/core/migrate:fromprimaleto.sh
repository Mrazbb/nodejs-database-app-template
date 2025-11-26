#!/usr/bin/env bash
set -euo pipefail

# Parse command-line arguments
MIGRATE_CMD="checkout"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --restore)
      MIGRATE_CMD="restore"
      shift
      ;;
    *)
      # Skip unknown arguments
      shift
      ;;
  esac
done

REMOTE_NAME="primaleto-cms"
REMOTE_URL="git@github.com:Mrazbb/primaleto-cms.git"

# 1. Add remote if missing
if git remote | grep -qx "$REMOTE_NAME"; then
  echo "✅ Remote '$REMOTE_NAME' already present."
else
  echo "➕ Adding remote '$REMOTE_NAME'..."
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi

# 2. Point to the latest SSH agent socket
export SSH_AUTH_SOCK
SSH_AUTH_SOCK=$(ls -t /tmp/ssh-*/agent.* 2>/dev/null | head -n1)
if [ -z "$SSH_AUTH_SOCK" ]; then
  echo "⚠️  No SSH agent socket found in /tmp/ssh-*."
else
  export SSH_AUTH_SOCK
  echo "🔑 Using SSH_AUTH_SOCK=$SSH_AUTH_SOCK"
fi

# 3. Sync branches
echo "🔄 Pulling latest on current branch..."
git pull --ff-only
echo "🔄 Fetching from '$REMOTE_NAME'..."
git fetch "$REMOTE_NAME"

# 4. Migrate files listed in .migrate
if [ -f .migrate ]; then
  if [ "$MIGRATE_CMD" = "restore" ]; then
    echo "📂 Restoring files from $REMOTE_NAME/main as per .migrate..."
    grep -v '^#' .migrate \
      | xargs git restore --source="$REMOTE_NAME/main" --
  else
    echo "📂 Checking out files from $REMOTE_NAME/main as per .migrate..."
    grep -v '^#' .migrate \
      | xargs git checkout --force "$REMOTE_NAME/main" --
  fi
else
  echo "ℹ️  No .migrate file found; skipping file checkout."
fi

# 5. Ensure task scripts are executable
if [ -d "./tasks" ]; then
  echo "🚀 Making ./tasks/* executable..."
  chmod +x ./tasks/*
else
  echo "ℹ️  No ./tasks directory; skipping chmod."
fi

echo "✅ Done."
