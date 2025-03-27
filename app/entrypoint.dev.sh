#!/bin/sh

# Create logs directory if it doesn't exist
mkdir -p logs

# Install npm dependencies and log output
npm install 2>&1 | tee -a logs/debug.log

# Install nodemon globally
npm i -g nodemon

# Run the Node.js application and log output
node index.js 2>&1 | tee -a logs/debug.log
