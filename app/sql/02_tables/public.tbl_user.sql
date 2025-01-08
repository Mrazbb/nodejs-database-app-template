CREATE TABLE "public"."tbl_user" (

    -- IDENTIFIERS
    "id" SERIAL NOT NULL,
    "useropid" TEXT NOT NULL,

    -- MAIN FIELDS
    "name" TEXT,
    "firstname" TEXT,
    "lastname" TEXT,
    "email" TEXT,

    -- NUMBERS    

    -- BOOLEANS
    "sa" BOOLEAN DEFAULT FALSE,

    -- DATES
    "dtcreated" TIMESTAMP,
    "dtupdated" TIMESTAMP,
    "dtremoved" TIMESTAMP,
    
    -- CONSTRAINTS
    PRIMARY KEY ("id")
);