#!/bin/bash

# Pre-flight checks remain the same
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed." >&2
    exit 1
fi


NODE_SCRIPT_PATH="toolkit_scripts/js/config_check.js"

if [ -f "$NODE_SCRIPT_PATH" ]; then
    # Execute the node script, passing all arguments ($@) to it
    node "$NODE_SCRIPT_PATH" "$@"
else
    echo "Error: Checker script not found at '$NODE_SCRIPT_PATH'" >&2
    exit 1
fi