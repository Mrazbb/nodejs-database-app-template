CREATE TABLE "public"."mtm_movie_production_country" (
    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "countryid" TEXT NOT NULL,

    CONSTRAINT "mtm_movie_production_country_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "mtm_movie_production_country_countryid_fkey" FOREIGN KEY ("countryid") REFERENCES "public"."tbl_production_country" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,

    PRIMARY KEY ("id")
); 