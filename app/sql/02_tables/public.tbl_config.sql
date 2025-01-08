CREATE TABLE "public"."tbl_config" (
    
    -- IDENTIFIERS
    "id" TEXT NOT NULL,

    -- MAIN FIELDS
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL, 

    PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tbl_config_id_index" ON "public"."tbl_config" ("id");