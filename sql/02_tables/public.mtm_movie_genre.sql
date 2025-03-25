CREATE TABLE "public"."mtm_movie_genre" (
    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "genreid" INTEGER NOT NULL,

    CONSTRAINT "mtm_movie_genre_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT "mtm_movie_genre_genreid_fkey" FOREIGN KEY ("genreid") REFERENCES "public"."tbl_genre" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,

    PRIMARY KEY ("id")
); 