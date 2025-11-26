#!/bin/bash
set -e

# Establish the project root
PROJECT_ROOT=$(cd "$(dirname "$0")/../.." && pwd)
cd "$PROJECT_ROOT"

TOOLKIT_SCRIPTS_DIR="toolkit_scripts/core"
VSCODE_DIR=".vscode"
TASKS_FILE="$VSCODE_DIR/tasks.json"

# Create the .vscode directory if it doesn't exist
mkdir -p "$VSCODE_DIR"

# Start writing the tasks.json file
cat > "$TASKS_FILE" << EOL
{
  "version": "2.0.0",
  "tasks": [
EOL

# Find all shell scripts in the core directory and add them as tasks
FIRST=true
for script in "$TOOLKIT_SCRIPTS_DIR"/*.sh; do
  if [ -f "$script" ]; then
    # Extract the command name from the script filename (e.g., "run.sh" -> "run")
    COMMAND=$(basename "$script" .sh)

    # Add a comma before adding the next task (except for the first one)
    if [ "$FIRST" = false ]; then
      echo "," >> "$TASKS_FILE"
    fi
    FIRST=false

    # Append the task definition to tasks.json
    cat >> "$TASKS_FILE" << EOL
    {
      "label": "toolkit: $COMMAND",
      "type": "shell",
      "command": "./bin/toolkit $COMMAND",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
EOL
  fi
done

# Close the JSON structure
cat >> "$TASKS_FILE" << EOL
  ]
}
EOL
