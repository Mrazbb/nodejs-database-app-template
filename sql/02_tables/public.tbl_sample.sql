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