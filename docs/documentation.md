# Project Documentation: nodejs-database-app-template

This document provides an overview of the `nodejs-database-app-template` project, including its API actions, core functions, and database schema. This is intended for use with Context7 to help coding agents understand and interact with the project.

## Project Structure Overview

The application is a Node.js project likely built using the Total.js framework. It features a plugin-based architecture for modularity, with plugins for admin functionalities, movie management, sample data, and settings. It uses a PostgreSQL database.

## Core Application Files

### `nodejs-database-app-template/app/index.js`
This is the main start script for the Total.js application. It initializes the framework with specified options.

```javascript nodejs-database-app-template/app/index.js
// ===================================================
// Total.js v5 start script
// https://www.totaljs.com
// ===================================================

require('total5');

const options = {};

// options.ip = '127.0.0.1';
// options.port = parseInt(process.argv[2]);
// options.unixsocket = PATH.join(F.tmpdir, 'app_name.socket');
// options.unixsocket777 = true;
// options.config = { name: 'Total.js' };
// options.sleep = 3000;
// options.inspector = 9229;
// options.watch = ['private'];
// options.livereload = 'https://yourhostname';
// options.watcher = true; // enables watcher for the release mode only controlled by the app `F.restart()`
// options.edit = 'wss://www.yourcodeinstance.com/?id=projectname'
options.release = process.argv.includes('--release');


// Service mode:
options.servicemode = process.argv.includes('--service') || process.argv.includes('--servicemode');
// options.servicemode = 'definitions,modules,config';

// Cluster:
// options.tz = 'utc';
// options.cluster = 'auto';
// options.limit = 10; // max 10. threads (works only with "auto" scaling)

F.run(options);
```

## Controllers

### `nodejs-database-app-template/app/controllers/default.js`
Handles default routing, admin panel views, and serves public files.

**Key Functions:**
*   `redirect_to_admin($)`: Redirects root access to `/admin/movies`.
*   `files_public($)`: Serves files from the `private/frontend` directory.
*   `admin($)`: Renders the main admin view, preparing plugin data for the UI.

**Event Handlers:**
*   `ON('controller', async function (controller))`: Modifies the user object on the controller, setting `user.sa = true` if the user has 'sa' permission.

### `nodejs-database-app-template/app/controllers/api.js`
Placeholder for API-related route installations. Currently empty.

## Definitions (Core Logic)

### `nodejs-database-app-template/app/definitions/auth.js`
Defines authentication logic for the application.

**Core Logic:**
*   `AUTH(function($))`: Central authentication function.
    *   For `/admin` path: Checks for `x-token`, Bearer token, OpenPlatform tokens, or falls back to `FUNC.authadmin` or a default `ADMIN` user.
    *   For other paths: Defers to `FUNC.auth` if available.

### `nodejs-database-app-template/app/definitions/core/db.js`
Initializes database connections.
*   Uses `dbms` for general database operations with PostgreSQL.
*   Uses `querybuilderpg` specifically for PostgreSQL query building.

### `nodejs-database-app-template/app/definitions/db.js`
Initializes a global `MAIN.db` object.

### `nodejs-database-app-template/app/definitions/development.js`
Contains development-specific logic, primarily file watchers for hot-reloading components, layouts, and widgets.

**Functions:**
*   `FUNC.load_components(ids)`: Reads JavaScript and CSS files from component directories, concatenates them, and writes to `public/admin-ui.js` and `public/admin-ui.css`.

**Event Handlers:**
*   `ON('ready', ...)`: Sets up file watchers for layouts, widgets, and components in development mode. Calls `FUNC.load_components()` on ready.

### `nodejs-database-app-template/app/definitions/func.js`
Provides global utility functions for the application.

**Functions:**
*   `FUNC.init_load()`: Initializes `MAIN.cache` and loads initial configuration.
*   `FUNC.load(callback)`: Refreshes content, merges plugin configurations with `MAIN.db.config`, reconfigures the application.
*   `FUNC.save()`: (Marked as TODO remove) Placeholder for saving site data.
*   `FUNC.unload(callback)`: (Marked as TODO remove) Placeholder for unload logic.
*   `FUNC.reconfigure()`: Loads configuration from `public.tbl_config` and applies it.
*   `FUNC.refresh()`: Clears `MAIN.cache`.
*   `FUNC.userid($)`: Retrieves or creates a user ID in `public.tbl_user` based on the controller's user object.
*   `FUNC.prepare($, model)`: Prepares model data for database operations by extracting `id`, deleting it from the model, and getting `userid`.

### `nodejs-database-app-template/app/definitions/init.js`
Initializes application-wide configurations and UI components.

**Configurations:**
*   Sets `CONF.$customtitles = true`.
*   Sets default `CONF.cdn`.
*   Sets `CONF.version`, `CONF.op_icon`, `CONF.op_path`.

**Event Handlers:**
*   `ON('ready', ...)`: Calls `FUNC.init_load()`, aggregates plugin permissions for OpenPlatform, and initializes UI components using `COMPONENTATOR`.

### `nodejs-database-app-template/app/definitions/shared/logger.js`
Provides global logging functions.

**Functions:**
*   `printerr(...error)`: Prints error messages with stack trace information.
*   `printlog(...error)`: Prints log messages with stack trace information.
*   `stringify(obj, spaces)`: JSON.stringify with circular reference handling.

### `nodejs-database-app-template/app/definitions/shared/shared.js`
Contains shared utility functions, potentially for URL generation, text sanitization, and translations.

**Functions:**
*   `FUNC.generate_url(structureid, langcountryid, isabsoluteurl=false)`: Generates a URL by calling a PostgreSQL function `public.fn_generate_url`.
*   `FUNC.get_config_page(name, langcountryid)`: Retrieves a configuration page URL by calling `public.fn_find_config_page_url`.
*   `FUNC.sanitaze_text(text)`: Sanitizes text by replacing special characters with HTML entities.
*   `FUNC.translate_names(languageid, model)`: Translates model property names ending with 'name'.

### `nodejs-database-app-template/app/definitions/versatile.js`
Contains various utility functions.

**Functions:**
*   `FUNC.normalize_url(value)`: Normalizes a string to be URL-friendly (lowercase, hyphenated, special characters removed).
*   `FUNC.normalize_id(value)`: Normalizes a string to be ID-friendly (lowercase, hyphenated, non-alphanumeric characters removed).
*   `FUNC.sanitaze_id(value)`: Sanitizes an ID by removing non-alphanumeric characters (except hyphens).
*   `FUNC.sleep(ms)`: Pauses execution for a specified number of milliseconds.

## Modules

### `nodejs-database-app-template/app/modules/cdn.js`
Handles downloading and caching of CDN assets (specifically `.html` files from `componentator.com`).

**Routes:**
*   `FILE /cdn/*.html`: Serves cached CDN files. If not cached, downloads and then serves.

**Functions:**
*   `exports.clear(callback)`: Clears the CDN cache directory.

### `nodejs-database-app-template/app/modules/openplatform.js`
Integrates with Total.js OpenPlatform for authentication and session management.

**Routes:**
*   `FILE /admin/openplatform.json`: Serves a JSON file with OpenPlatform metadata (name, icon, URL, permissions).

**Core Logic:**
*   `Data.auth($)`: Authentication function for OpenPlatform. Validates tokens, fetches session data from the OpenPlatform server if needed, and caches sessions locally.
*   Manages session expiry.
*   Provides helper functions (`Json`, `Notification`, `Logout`) for OpenPlatform session objects.

### `nodejs-database-app-template/app/modules/visitors.js`
Tracks website visitors and collects statistics.

**Routes:**
*   `GET /$visitors/`: Endpoint for client-side ping to track visitor activity.

**Core Logic:**
*   `W.counter($)`: Main function to process visitor pings, identify unique visitors, track referrers, browsers, pages visited, etc.
*   Maintains in-memory statistics (`W.stats`) and periodically saves/loads them from `visitors.cache`.
*   Appends daily statistics to a `nosql/visitors` data store.
*   Publishes `visitor` events.
*   Provides functions to retrieve daily, monthly, and yearly statistics.
*   Supports a blacklist for URLs.

## Plugins

### Plugin: Admin (`nodejs-database-app-template/app/plugins/admin/`)

Manages admin user accounts and authentication.

**File: `nodejs-database-app-template/app/plugins/admin/index.js`**
*   **Exports:** `icon`, `name`, `position`, `import`, `hidden`.
*   **Routes:**
    *   `+API ? -admin_read --> Admin/read`
    *   `+API ? +admin_save --> Admin/save`
    *   `+API ? -logout --> Admin/logout`
    *   `-API ? +login --> Admin/login`
    *   `-GET ?/* login` (fallback to login view)
*   **Functions:**
    *   `FUNC.authadmin($)`: Authenticates an admin user based on a cookie and session data.
*   **Actions:**
    *   `NEWACTION('Admin/read', ...)`: Reads the current admin's profile.
    *   `NEWACTION('Admin/save', ...)`: Saves changes to the admin's profile (name, login, password).
    *   `NEWACTION('Admin/login', ...)`: Logs in an admin user.
    *   `NEWACTION('Admin/logout', ...)`: Logs out an admin user.
*   Initializes a default admin user if one doesn't exist in `MEMORIZE('account')`.

**Associated UI Files:**
*   `nodejs-database-app-template/app/plugins/admin/login.html`: The login page for administrators.
*   `nodejs-database-app-template/app/plugins/admin/public/extensions.html`: Adds an account menu to the header for changing credentials and logging out.
*   `nodejs-database-app-template/app/plugins/admin/public/form.html`: The form for changing admin credentials.

---

### Plugin: Movies (`nodejs-database-app-template/app/plugins/movies/`)

Manages movie data.

**File: `nodejs-database-app-template/app/plugins/movies/index.js`**
*   **Exports:** `icon`, `name`, `position`, `visible`.
*   **Routes:**
    *   `+API ? -movies_list --> Movies/list`
    *   `+API ? -movies_read --> Movies/read`
    *   `+API ? -movies_save --> Movies/save`

**File: `nodejs-database-app-template/app/plugins/movies/schemas/movies.js`**
*   **Actions:**
    *   `NEWACTION('Movies/list', ...)`: Lists movies with filtering and pagination.
        *   Input: `page, limit, sort, id, title, adult, budget, homepage, imdb_id, original_language, original_title, overview, popularity, poster_path, release_date, revenue, runtime, status, tagline, video, vote_average, vote_count, genres, production_companies, production_countries, spoken_languages, dtcreated, dtupdated, dtremoved`
    *   `NEWACTION('Movies/read', ...)`: Reads a single movie by ID.
        *   Input: `*id:Number`
    *   `NEWACTION('Movies/save', ...)`: Creates or updates a movie and its related MTM (Many-To-Many) table entries for genres, production companies, countries, and spoken languages.
        *   Input: `id:Number, title:String, adult:Boolean, budget:Number, homepage:String, imdb_id:String, original_language:String, original_title:String, overview:String, popularity:Number, poster_path:String, release_date:Date, revenue:Number, runtime:Number, status:String, tagline:String, video:Boolean, vote_average:Number, vote_count:Number, genreids:[Number], production_company_ids:[Number], production_country_ids:[String], spoken_language_ids:[String]`
    *   `NEWACTION('Movies/process', ...)`: (Purpose seems to be iterating through movies, but the `processmovies` function is empty).
        *   Input: `id:Number, ids:[Number]`

**Associated UI Files:**
*   `nodejs-database-app-template/app/plugins/movies/public/index.html`: The main listing page for movies, using a datagrid. Allows creation, refresh, and viewing/updating movies.
*   `nodejs-database-app-template/app/plugins/movies/public/form.html`: The form for creating and editing movie details.

---

### Plugin: Samples (`nodejs-database-app-template/app/plugins/samples/`)

Manages sample data.

**File: `nodejs-database-app-template/app/plugins/samples/index.js`**
*   **Exports:** `icon`, `name`, `position`, `visible`.
*   **Routes:**
    *   `+API ? -samples_list --> Samples/list`
    *   `+API ? -samples_read --> Samples/read`
    *   `+API ? -samples_save --> Samples/save`

**File: `nodejs-database-app-template/app/plugins/samples/schemas/samples.js`**
*   **Actions:**
    *   `NEWACTION('Samples/list', ...)`: Lists samples with filtering and pagination.
        *   Input: `page, limit, sort, id, name, dtcreated, dtupdated, dtremoved, createdby, updatedby, removedby`
    *   `NEWACTION('Samples/read', ...)`: Reads a single sample by ID.
        *   Input: `*id:Number`
    *   `NEWACTION('Samples/remove', ...)`: Removes a sample by ID.
        *   Input: `id:Number`
    *   `NEWACTION('Samples/save', ...)`: Creates or updates a sample.
        *   Input: `id:Number, name:String, countupdate:Number, createdbyid:Number, updatedbyid:Number, removedbyid:Number`

**Associated UI Files:**
*   `nodejs-database-app-template/app/plugins/samples/public/index.html`: The main listing page for samples, using a datagrid.
*   `nodejs-database-app-template/app/plugins/samples/public/form.html`: The form for creating and editing sample data.

---

### Plugin: Settings (`nodejs-database-app-template/app/plugins/settings/`)

Manages application settings and provides some account-related actions.

**File: `nodejs-database-app-template/app/plugins/settings/index.js`**
*   **Exports:** `icon`, `name`, `position`, `permissions`, `visible`.
*   **Routes:**
    *   `+API ? -account --> Account/read`
    *   `+API ? +chatgpt <60s --> ChatGPT/ask`
    *   `+API ? -settings_read --> Settings/read`
    *   `+API ? +settings_test --> Settings/test`
    *   `+API ? +settings_save --> Settings/save`
    *   `+API ? -dependencies_load --> Settings/dependencies/load`
*   **Actions:**
    *   `NEWACTION('Account/read', ...)`: Reads basic information about the currently logged-in user.
    *   `NEWACTION('ChatGPT/ask', ...)`: Proxies a request to a TAPI 'chatgpt' service.
        *   Input: `*value:String;type:{text|image}`

**File: `nodejs-database-app-template/app/plugins/settings/schemas/dependencies.js`**
*   **Actions:**
    *   `NEWACTION('Settings/dependencies/load', ...)`: Loads various dependency data from the database (genres, collections, production companies, countries, spoken languages) and formats it into an object.

**File: `nodejs-database-app-template/app/plugins/settings/schemas/settings.js`**
*   **Actions:**
    *   `NEWACTION('Settings/read', ...)`: Reads all configuration settings from `public.tbl_config` and merges them with plugin-defined configurations.
    *   `NEWACTION('Settings/save', ...)`: Saves application settings to `public.tbl_config`.
        *   Input includes various specific settings and an `items` array for plugin-specific settings: `name, url, order_create_page, order_info_page, defaultcurrency, cart_page, stripe_secret_token, stripe_public_token, defaultwatermarkuid, stripe_hook_token, smtp, icon, $tms, secret_tms, op_reqtoken, op_restoken, eshop_op_reqtoken, eshop_op_restoken, totalapi, defaultlangid, defaultlangcountryid, defaultlangcountrypage, isenabledcache, items:[*id:String, value:Object], error400structureid, error401structureid, error403structureid, error404structureid`
    *   `NEWACTION('Settings/test', ...)`: Tests SMTP settings.
        *   Input: `*smtp:JSON`

**Associated UI Files:**
*   `nodejs-database-app-template/app/plugins/settings/public/index.html`: The UI for managing various application settings, including website name, URL, TMS, Total.js API, and OpenPlatform settings.

## Database Schema

### SQL Schemas

**File: `nodejs-database-app-template/sql/01_schemas/public.sql`**
Ensures the `public` schema exists.
```sql
CREATE SCHEMA IF NOT EXISTS public;
```

### SQL Tables

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_collection.sql`**
Stores movie collection data.
```sql
CREATE TABLE "public"."tbl_collection" (

    -- IDENTIFIER
    "id" INTEGER NOT NULL,

    -- FIELDS
    "name" TEXT,
    "poster_path" TEXT,
    "backdrop_path" TEXT,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_config.sql`**
Stores application configuration key-value pairs.
```sql
CREATE TABLE "public"."tbl_config" (

    -- IDENTIFIERS
    "id" TEXT NOT NULL,

    -- MAIN FIELDS
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tbl_config_id_index" ON "public"."tbl_config" ("id");
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_genre.sql`**
Stores movie genre information.
```sql
CREATE TABLE "public"."tbl_genre" (

    -- IDENTIFIER
    "id" INTEGER NOT NULL,

    -- FIELDS
    "genre_id" INTEGER,
    "name" TEXT,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_movie.sql`**
The main table for movie data.
```sql
CREATE TABLE "public"."tbl_movie" (

    -- IDENTIFIER
    "id" BIGINT NOT NULL,

    -- MAIN FIELDS
    "adult" BOOLEAN,
    "collectionid" INTEGER,
    "budget" NUMERIC,
    "homepage" TEXT,
    "imdb_id" TEXT,
    "original_language" TEXT,
    "original_title" TEXT,
    "overview" TEXT,
    "popularity" NUMERIC(10, 6),
    "poster_path" TEXT,
    "release_date" DATE,
    "revenue" NUMERIC,
    "runtime" INTEGER,
    "status" TEXT,
    "tagline" TEXT,
    "title" TEXT,
    "video" BOOLEAN,
    "vote_average" NUMERIC(3, 1),
    "vote_count" INTEGER,

	"dtcreated" TIMESTAMP,
	"dtupdated" TIMESTAMP,
    "dtremoved" TIMESTAMP,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_production_company.sql`**
Stores movie production company information.
```sql
CREATE TABLE "public"."tbl_production_company" (

    -- IDENTIFIER
    "id" INTEGER NOT NULL,

    -- FIELDS
    "company_id" INTEGER,
    "name" TEXT,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_production_country.sql`**
Stores movie production country information.
```sql
CREATE TABLE "public"."tbl_production_country" (

    -- IDENTIFIER
    "id" TEXT NOT NULL, -- Likely ISO 3166-1 alpha-2 code

    -- FIELDS
    "iso_3166_1" TEXT,
    "name" TEXT,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_sample.sql`**
Stores sample data entries.
```sql
CREATE TABLE "public"."tbl_sample" (

    -- IDENTIFIERS
    "id" SERIAL NOT NULL,

    -- MAIN FIELDS
    "name" TEXT,
    "body" TEXT,

    -- NUMBERS
    "countupdate" INTEGER DEFAULT 0,

    -- BOOLEANS
    "ismobile" BOOLEAN DEFAULT FALSE,

    -- USER
    "createdbyid" INTEGER,
    "updatedbyid" INTEGER,
    "removedbyid" INTEGER,
	"dtcreated" TIMESTAMP,
	"dtupdated" TIMESTAMP,
    "dtremoved" TIMESTAMP,

    CONSTRAINT "tbl_product_createdbyid_fkey" FOREIGN KEY ("createdbyid") REFERENCES "public"."tbl_user"("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "tbl_product_updatedbyid_fkey" FOREIGN KEY ("updatedbyid") REFERENCES "public"."tbl_user"("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "tbl_product_removedbyid_fkey" FOREIGN KEY ("removedbyid") REFERENCES "public"."tbl_user"("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE SET NULL,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_spoken_language.sql`**
Stores movie spoken language information.
```sql
CREATE TABLE "public"."tbl_spoken_language" (

    -- IDENTIFIER
    "id" TEXT NOT NULL, -- Likely ISO 639-1 code

    -- FIELDS
    "name" TEXT,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.tbl_user.sql`**
Stores application user information, linking to OpenPlatform users.
```sql
CREATE TABLE "public"."tbl_user" (

    -- IDENTIFIERS
    "id" SERIAL NOT NULL,
    "useropid" TEXT NOT NULL, -- OpenPlatform User ID

    -- MAIN FIELDS
    "name" TEXT,
    "firstname" TEXT,
    "lastname" TEXT,
    "email" TEXT,

    -- BOOLEANS
    "sa" BOOLEAN DEFAULT FALSE, -- Super Admin flag

    -- DATES
    "dtcreated" TIMESTAMP,
    "dtupdated" TIMESTAMP,
    "dtremoved" TIMESTAMP,

    -- CONSTRAINTS
    PRIMARY KEY ("id")
);
```

**Many-to-Many Tables for Movies:**

**File: `nodejs-database-app-template/sql/02_tables/public.mtm_movie_genre.sql`**
Links movies to genres.
```sql
CREATE TABLE "public"."mtm_movie_genre" (
    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "genreid" INTEGER NOT NULL,

    CONSTRAINT "mtm_movie_genre_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "mtm_movie_genre_genreid_fkey" FOREIGN KEY ("genreid") REFERENCES "public"."tbl_genre" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.mtm_movie_production_company.sql`**
Links movies to production companies.
```sql
CREATE TABLE "public"."mtm_movie_production_company" (
    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "companyid" INTEGER NOT NULL,

    CONSTRAINT "mtm_movie_production_company_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "mtm_movie_production_company_companyid_fkey" FOREIGN KEY ("companyid") REFERENCES "public"."tbl_production_company" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.mtm_movie_production_country copy.sql`** (Note: filename has "copy")
Links movies to production countries.
```sql
CREATE TABLE "public"."mtm_movie_production_country" (
    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "countryid" TEXT NOT NULL,

    CONSTRAINT "mtm_movie_production_country_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "mtm_movie_production_country_countryid_fkey" FOREIGN KEY ("countryid") REFERENCES "public"."tbl_production_country" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY ("id")
);
```

**File: `nodejs-database-app-template/sql/02_tables/public.mtm_movie_spoken_language.sql`**
Links movies to spoken languages.
```sql
CREATE TABLE "public"."mtm_movie_spoken_language" (
    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "spokenlanguageid" TEXT NOT NULL,

    CONSTRAINT "mtm_movie_spoken_language_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "mtm_movie_spoken_language_spokenlanguageid_fkey" FOREIGN KEY ("spokenlanguageid") REFERENCES "public"."tbl_spoken_language" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY ("id")
);
```

### SQL Views

**File: `nodejs-database-app-template/sql/03_views/public.view_movie.sql`**
Provides a consolidated view of movie data, aggregating related information (genres, companies, countries, languages) as JSON arrays.
```sql
CREATE OR REPLACE VIEW "public"."view_movie" AS (
    SELECT
        m.id,
        m.title,
        m.adult,
        m.budget,
        m.homepage,
        m.imdb_id,
        m.original_language,
        m.original_title,
        m.overview,
        m.popularity,
        m.poster_path,
        m.release_date,
        m.revenue,
        m.runtime,
        m.status,
        m.tagline,
        m.video,
        m.vote_average,
        m.vote_count,
        m.dtcreated,
        m.dtupdated,
        m.dtremoved,
        m.collectionid,
        -- Aggregate genres
        ( SELECT JSON_AGG(g) FROM public.tbl_genre AS g
            JOIN public.mtm_movie_genre AS mg ON mg.genreid = g.id
            WHERE mg.movieid = m.id
        ) AS genres,
        -- Aggregate production companies
        ( SELECT JSON_AGG(pc) FROM public.tbl_production_company AS pc
            JOIN public.mtm_movie_production_company AS mpc ON mpc.companyid = pc.id
            WHERE mpc.movieid = m.id
        ) AS production_companies,
        -- Aggregate production countries
        ( SELECT JSON_AGG(co) FROM public.tbl_production_country AS co
            JOIN public.mtm_movie_production_country AS mco ON mco.countryid = co.id
            WHERE mco.movieid = m.id
        ) AS production_countries,
        -- Aggregate spoken languages
        ( SELECT JSON_AGG(sl) FROM public.tbl_spoken_language AS sl
            JOIN public.mtm_movie_spoken_language AS msl ON msl.spokenlanguageid = sl.id
            WHERE msl.movieid = m.id
        ) AS spoken_languages
    FROM public.tbl_movie AS m
);
```

**File: `nodejs-database-app-template/sql/03_views/public.view_sample_list.sql`**
Provides a view for sample data, joining with user information for creator/updater names.
```sql
CREATE OR REPLACE VIEW "public"."view_sample_list" AS (
	SELECT
        m.id,
        m.name,
        m.body,
        m.countupdate,
        m.ismobile,

        -- user
        m.createdbyid,
        m.updatedbyid,
        m.removedbyid,
		createdby.name AS createdbyname,
		updatedby.name AS updatedbyname,
		removedby.name AS removedbyname,
        m.dtcreated,
        m.dtupdated,
        m.dtremoved
	FROM
		public.tbl_sample m -- m is for main table
		LEFT JOIN tbl_user createdby ON createdby.id = m.createdbyid
		LEFT JOIN tbl_user updatedby ON updatedby.id = m.updatedbyid
		LEFT JOIN tbl_user removedby ON removedby.id = m.removedbyid
);
```

## Best Practices for Context7 Integration

*   **Keep descriptions concise**: Ensure action and function descriptions are clear and to the point for coding agents.
*   **Detail `NEWACTION` inputs**: The input parameters for `NEWACTION`s are crucial for agents to understand how to call them. The current format in the schemas (`input: *name,*login,password`) is good.
*   **Explain `FUNC` purpose**: Briefly explain what each global `FUNC` does.
*   **Highlight important configurations**: Note any critical `CONF` variables that affect behavior.
*   **Clarify database relationships**: The SQL foreign key constraints are good, but a brief textual explanation of how tables relate (especially MTM tables) can be helpful.
*   **Specify permissions**: Where actions have specific permissions (e.g., `permission: 'admin'`), ensure this is noted.

This document should provide a solid foundation for Context7 to understand your project. You can further enhance it by adding more detailed explanations for complex logic or specific use cases.