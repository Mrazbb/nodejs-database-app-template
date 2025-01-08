CREATE TABLE "public"."mtm_movie_production_company" (

    "id" SERIAL,
    "movieid" BIGINT NOT NULL,
    "companyid" INTEGER NOT NULL,

    CONSTRAINT "mtm_movie_production_company_movieid_fkey" FOREIGN KEY ("movieid") REFERENCES "public"."tbl_movie" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT "mtm_movie_production_company_companyid_fkey" FOREIGN KEY ("companyid") REFERENCES "public"."tbl_production_company" ("id") MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,

    PRIMARY KEY ("id")

); 