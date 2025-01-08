## Nodejs Database App Template

This example can be viewed on https://www.nodejs-database-app-template.marek-mraz.com/admin/movies





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

### Dcoker compose local

```bash
docker compose up -d
```

### Dcoker compose with traefik

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```







