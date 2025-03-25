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