#!/bin/bash

# --- Pre-flight Checks ---

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install Node.js to use this command."
    exit 1
fi


# 3. Check if npm dotenv is installed and if not install it
if ! npm list dotenv &> /dev/null
then
    npm install dotenv
fi

# The main toolkit script has already changed the directory to the project root.
# We can now execute the node script with confidence.
NODE_SCRIPT_PATH="toolkit_scripts/js/config_generate.js"

if [ -f "$NODE_SCRIPT_PATH" ]; then
    node "$NODE_SCRIPT_PATH"
else
    echo "Error: Generator script not found at '$NODE_SCRIPT_PATH'"
    exit 1
fi