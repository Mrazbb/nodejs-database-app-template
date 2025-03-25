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