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




## Installation
```bash
git clone git@github.com:Mrazbb/nodejs-database-app-template.git
cd nodejs-database-app-template
npm update --save
npm install
cp sample.main.env main.env
cp app/sample.altergen.json app/altergen.json
chmod +x app/entrypoint.sh
```

### Edit main.env and ./app/altergen.json files with your database credentials

### Generate config

```bash
npm run generate:config
```

### Generate altergen

```bash
npm run generate:altergen
```
File was generated in folder app/sql/ (alter.sql) with all information to create database, schemas, views, functions, triggers, and also basic data for initial setup.

### Migrate alter script to database

```bash
npm run migrate:altergen
```


### Docker Compose Configuration
#### Step 1. update main.env
**Development: (main.env)**
```env
COMPOSE_FILE=docker-compose.yml:docker-compose.traefik.yml:docker-compose.dev.yml
```

**Production: (main.env)**
```env
COMPOSE_FILE=docker-compose.yml:docker-compose.traefik.yml
```

**Local: (main.env)**
```env
COMPOSE_FILE=docker-compose.yml
```


#### Step 2: Create NPM scripts in `package.json`

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


#### Step 3: Usage

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


This setup simplifies environment management and script usage, ensuring your Docker workflows remain clear and maintainable.











