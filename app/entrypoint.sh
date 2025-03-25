#!/bin/sh
set -e

mkdir -p logs
npm install > logs/npm-install.log 2>&1
npm install -g nodemon >> logs/npm-install.log 2>&1

exec node index.js >> logs/app.log 2>&1
