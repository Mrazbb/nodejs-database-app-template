CREATE TABLE "public"."mtm_movie_spoken_language" (
    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "spokenlanguageid" TEXT NOT NULL,

    CONSTRAINT "mtm_movie_spoken_language_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "mtm_movie_spoken_language_spokenlanguageid_fkey" FOREIGN KEY ("spokenlanguageid") REFERENCES "public"."tbl_spoken_language" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,

    PRIMARY KEY ("id")
); 