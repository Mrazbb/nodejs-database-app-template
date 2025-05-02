## Nodejs Database App Template

This example can be viewed on https://www.nodejs-database-app-template.marek-mraz.com/admin/movies




## REST API TEMPLATE

[ Processing throught all records NEWACTION('Movies/process') ](app/plugins/movies/schemas/movies.js)



https://github.com/user-attachments/assets/3b90c79e-1c44-4235-b974-3b7b7d36b2ac




## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)


❗This template is main example how **pg-altergen** can be used.❗



Template for building a nodejs application with a PostgreSQL database.
This template can be used as a starting point for building a new application in Total.js or any other nodejs framework. 

Database is managed with my library pg-altergen, that I created for easy management of database versioning and migrations. In folder app/sql you can find sql scripts for creating database, schemas, views, functions, triggers, and also basic data for initial setup.

In this example in folder app/sql/10_insert are data about movies. 



Links: 
- Total.js: https://www.totaljs.com/
- Total.js Framework (nodejs framework): https://github.com/totaljs/framework
- Componentator (component library): https://componentator.com/
- pg-altergen (Database versioning and migrations): https://github.com/Mrazbb/pg-altergen




## Create Project
```bash
git clone git@github.com:Mrazbb/nodejs-database-app-template.git
cd nodejs-database-app-template
chmod +x ./scripts/*.sh
npm update --save
npm install
cp .env.main.sample .env.main
cp app/sample.altergen.json app/altergen.json
chmod +x app/entrypoint.sh
```
## Edit .env.main and altergen.json files with your database credentials

## Generate config (.env and config) from .env.main

```bash
npm run config:generate
```


## Docker Compose Configuration
### Step 1. update .env.main
**Development: (.env.main)**
```env
COMPOSE_FILE=docker-compose.yml:docker-compose.traefik.yml:docker-compose.dev.yml
```

**Production: (.env.main)**
```env
COMPOSE_FILE=docker-compose.yml:docker-compose.traefik.yml
```

**Local: (.env.main)**
```env
COMPOSE_FILE=docker-compose.yml
```


### Step 2: Create NPM scripts in `package.json`

Add the following scripts to your `package.json`:

```json
"scripts": {
    "up": "docker compose up -d",
    "down": "docker compose down",
    "restart": "docker compose restart",
    "stop": "docker compose stop",
    "kill": "docker compose kill"
}
```


### Step 3: Usage

To specify your environment, copy or rename the relevant `.env` file to `.env`:

Then run the Docker Compose commands easily:

```bash
npm run up        # Start containers
docker ps         # Verify containers

npm run down      # Stop and remove containers
npm run restart   # Restart containers
npm run stop      # Stop containers
npm run kill      # Forcefully kill containers
```

## Starting the project

```bash
npm run up
```
## LOGS

```bash
npm run logs app
npm run logs postgres
```

## Shell inside the container

```bash
npm run exec app
npm run exec postgres
```


## Create Database from definition from the folder SQL

```bash
npm run altergen:build-image
npm run altergen
```

## Backup and Restore Postgres

```bash
npm run postgres:backup [backup.sql]
npm run postgres:restore [backup.sql]
```



















