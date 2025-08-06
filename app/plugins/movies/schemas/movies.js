
// LIST
NEWACTION('Movies/list', {
    name: 'List Movies',
	// permissions: 'movies', // TODO: add permissions
	input: `page:number, limit:number, sort:string, id:string, title:string, adult:boolen, budget:number, homepage:string, imdb_id:string, original_language:string, original_title:string, overview:string, popularity:number, poster_path:string, release_date:date, revenue:number, runtime:number, status:string, tagline:string, video:boolen, vote_average:number, vote_count:number, genres:string, production_companies:string, production_countries:string, spoken_languages:string, dtcreated:date, dtupdated:date, dtremoved:date`,
	action: async function ($, model) {
		var opt = model;

		Object.keys(opt).forEach(key => {
			if (opt[ key ] === 'undefined' || opt[ key ] === 'null' || opt[ key ] === ''  || opt[ key ] === null)
				delete opt[ key ];
		});
		console.log(opt);
		

		if (opt.q)
			opt.q = opt.q.toSearch();

		if (!opt.page)
			opt.page = 1;

		if (!opt.limit)
			opt.limit = 100;

		if (opt.limit > 1000)
			opt.limit = 1000;


		var builder = DATA.list(`public.view_movie`);

  		opt.id && builder.in('id', opt.id);
		opt.title && builder.gridfilter('title', opt, String);
		opt.adult && builder.gridfilter('adult', opt, Boolean);
		opt.budget && builder.in('budget', opt.budget);
		opt.homepage && builder.gridfilter('homepage', opt, String);
		opt.imdb_id && builder.gridfilter('imdb_id', opt, String);
		opt.original_language && builder.gridfilter('original_language', opt, String);
		opt.original_title && builder.gridfilter('original_title', opt, String);
		opt.overview && builder.gridfilter('overview', opt, String);
		opt.popularity && builder.in('popularity', opt.popularity);
		opt.poster_path && builder.gridfilter('poster_path', opt, String);
		opt.release_date && builder.gridfilter('release_date', opt, Date);
		opt.revenue && builder.in('revenue', opt.revenue);
		opt.runtime && builder.in('runtime', opt.runtime);
		opt.status && builder.gridfilter('status', opt, String);
		opt.tagline && builder.gridfilter('tagline', opt, String);
		opt.video && builder.gridfilter('video', opt, Boolean);
		opt.vote_average && builder.in('vote_average', opt.vote_average);
		opt.vote_count && builder.in('vote_count', opt.vote_count);
		
		// genres
		opt.genres = opt?.genres?.replace(/'/g, "''");
		opt.genres && builder.where(`EXISTS (
			SELECT 1
			FROM jsonb_array_elements("genres"::JSONB) AS genre
			WHERE genre->>'name' ILIKE '%${opt.genres}%'
		)`);

		// production_companies
		opt.production_companies = opt?.production_companies?.replace(/'/g, "''");
		opt.production_companies && builder.where(`EXISTS (
			SELECT 1
			FROM jsonb_array_elements("production_companies"::JSONB) AS company
			WHERE company->>'name' ILIKE '%${opt.production_companies}%'
		)`);

		// production_countries
		opt.production_countries = opt?.production_countries?.replace(/'/g, "''");
		opt.production_countries && builder.where(`EXISTS (
			SELECT 1
			FROM jsonb_array_elements("production_countries"::JSONB) AS country
			WHERE country->>'name' ILIKE '%${opt.production_countries}%'
		)`);

		// spoken_languages
		opt.spoken_languages = opt?.spoken_languages?.replace(/'/g, "''");
		opt.spoken_languages && builder.where(`EXISTS (
			SELECT 1
			FROM jsonb_array_elements("spoken_languages"::JSONB) AS language
			WHERE language->>'name' ILIKE '%${opt.spoken_languages}%'
		)`);


        opt.dtcreated && builder.gridfilter('dtcreated', opt, Date);
        opt.dtupdated && builder.gridfilter('dtupdated', opt, Date);
        opt.dtremoved && builder.gridfilter('dtremoved', opt, Date);
		
		builder.where('dtremoved IS NULL');

        if (opt.sort) {
            builder.gridsort(opt.sort);
        } else {
            builder.sort('dtcreated', true);
        }

        builder.paginate(opt.page, opt.limit);
        builder.callback(async function (err, response) {
            if (err) {
                $.invalid(err);
            } else {
				$.callback(response);
            }
        });

    }
});

// READ
NEWACTION('Movies/read', {
	name: 'Read Movies',
	// permissions: 'movies', // TODO: add permissions
	input: `*id:Number`,
	action: async function ($, model) {
		DATA.find(`public.view_movie`).where('id', model.id).where('dtremoved IS NULL').first().callback($);	
	}
});


// SAVE
NEWACTION('Movies/save', {
	name: 'Update Movie',
	permissions: 'movies',
	input: `id:Number, title:String, adult:Boolean, budget:Number, homepage:String, imdb_id:String, original_language:String, original_title:String, overview:String, popularity:Number, poster_path:String, release_date:Date, revenue:Number, runtime:Number, status:String, tagline:String, video:Boolean, vote_average:Number, vote_count:Number, genreids:[Number], production_company_ids:[Number], production_country_ids:[String], spoken_language_ids:[String]`,
	action: async function ($, model) {
		console.log('model', model);

		let userid = await FUNC.userid($);
		let payload = CLONE(model);
		delete payload.genreids;
		delete payload.production_company_ids;
		delete payload.production_country_ids;
		delete payload.spoken_language_ids;


		// update movie
		if (model.id) {
			payload.dtupdated = NOW;
			DATA.update(`public.tbl_movie`, payload).where('id', model.id).callback($);
		} else {
			payload.dtcreated = NOW;
			payload.dtupdated = NOW;
			model.id = await DATA.insert(`public.tbl_movie`, payload).primarykey('id').promise();
		}


		// update genres
		let genres_db = await DATA.find(`public.mtm_movie_genre`).where('movieid', model.id).promise();
		for (let genreid of model.genreids) {
			if (genres_db.findIndex('genreid', genreid) === -1) {
				await DATA.insert(`public.mtm_movie_genre`, { movieid: model.id, genreid: genreid }).promise();
			}
		}

		for (let genre of genres_db) {
			if (!model.genreids.find(item => item == genre.genreid)) {
				console.log('remove', genre.genreid, genre.name);
				await DATA.remove(`public.mtm_movie_genre`).where('movieid', model.id).where('genreid', genre.genreid).promise();
			}
		}


		// update production_companies
		let production_companies_db = await DATA.find(`public.mtm_movie_production_company`).where('movieid', model.id).promise();
		for (let companyid of model.production_company_ids) {
			if (production_companies_db.findIndex('companyid', companyid) === -1) {
				await DATA.insert(`public.mtm_movie_production_company`, { movieid: model.id, companyid: companyid }).promise();
			}
		}

		for (let production_company of production_companies_db) {
			if (!model.production_company_ids.find(item => item == production_company.companyid)) {
				await DATA.remove(`public.mtm_movie_production_company`).where('movieid', model.id).where('companyid', production_company.companyid).promise();
			}
		}


		// update production_countries
		let production_countries_db = await DATA.find(`public.mtm_movie_production_country`).where('movieid', model.id).promise();
		for (let countryid of model.production_country_ids) {
			if (production_countries_db.findIndex('countryid', countryid) === -1) {
				await DATA.insert(`public.mtm_movie_production_country`, { movieid: model.id, countryid: countryid }).promise();
			}
		}

		for (let production_country of production_countries_db) {
			if (!model.production_country_ids.find(item => item == production_country.countryid)) {
				await DATA.remove(`public.mtm_movie_production_country`).where('movieid', model.id).where('countryid', production_country.countryid).promise();
			}
		}

		// update spoken_languages
		let spoken_languages_db = await DATA.find(`public.mtm_movie_spoken_language`).where('movieid', model.id).promise();
		for (let spokenlanguageid of model.spoken_language_ids) {
			if (spoken_languages_db.findIndex('spokenlanguageid', spokenlanguageid) === -1) {
				await DATA.insert(`public.mtm_movie_spoken_language`, { movieid: model.id, spokenlanguageid: spokenlanguageid }).promise();
			}
		}

		for (let spoken_language of spoken_languages_db) {
			if (!model.spoken_language_ids.find(item => item == spoken_language.spokenlanguageid)) {
				await DATA.remove(`public.mtm_movie_spoken_language`).where('movieid', model.id).where('spokenlanguageid', spoken_language.spokenlanguageid).promise();
			}
		}

		$.callback(model);
	}
});

// paginate through movies
NEWACTION('Movies/process', {
	name: 'Process Movie',
	permissions: 'movies',
	input: `id:Number, ids:[Number]`,
	action: async function ($, model) {

		let limit = 100;
        let where = ['TRUE'];

		if (model.id)
			where.push(`id = ${model.id}`);

		if (model.ids)
			where.push(`id IN (${model.ids.join(',')})`);
		
		let maxlimit = await DATA.count(`public.tbl_movie`).where(where.join(' AND ')).promise();

		const processmovies = async (item) => {
			console.log(item.id);
		}

		for (let page = 1; page <= (maxlimit / limit + 1); page++) {
			let items = await DATA.find(`public.tbl_movie`).where(where.join(' AND ')).paginate(page, limit, maxlimit).sort('id').promise();
			for (let item of items) {
				await processmovies(item);
			}
		}

		$.callback(true);
	}
});