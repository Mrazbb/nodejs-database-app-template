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