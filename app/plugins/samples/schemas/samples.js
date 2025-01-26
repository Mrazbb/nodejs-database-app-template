
// LIST
NEWACTION('Samples/list', {
    name: 'List Samples',
    // permissions: 'samples', // TODO: add permissions
	input: `page:number, limit:number, sort:string, id:string, name:string, dtcreated:date, dtupdated:date, dtremoved:date, createdby:string, updatedby:string, removedby:string`,
	action: async function ($, model) {
		var opt = model;

		Object.keys(opt).forEach(key => {
			if (opt[ key ] === 'undefined' || opt[ key ] === 'null' || opt[ key ] === ''  || opt[ key ] === null)
				delete opt[ key ];
		});

		if (opt.q)
			opt.q = opt.q.toSearch();

		if (!opt.page)
			opt.page = 1;

		if (!opt.limit)
			opt.limit = 100;

		if (opt.limit > 1000)
			opt.limit = 1000;


		var builder = DATA.list(`public.view_sample_list`);

  		opt.id && builder.in('id', opt.id);
		opt.name && builder.gridfilter('name', opt, String);

        opt.dtcreated && builder.gridfilter('dtcreated', opt, Date);
        opt.dtupdated && builder.gridfilter('dtupdated', opt, Date);
        opt.dtremoved && builder.gridfilter('dtremoved', opt, Date);
        opt.createdbyname && builder.gridfilter('createdbyname', opt, String);
        opt.createdbyname && builder.gridfilter('updatedbyname', opt, String);
        opt.createdbyname && builder.gridfilter('removedbyname', opt, String);
		
		builder.where('dtremoved IS NULL');

        if (opt.sort) {
            builder.gridsort(opt.sort);
        } else {
            builder.gridsort('dtupdated_desc');
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
NEWACTION('Samples/read', {
	name: 'Read Samples',
	// permissions: 'samples', // TODO: add permissions
	input: `*id:Number`,
	action: async function ($, model) {
		DATA.find(`public.view_sample_list`).where('id', model.id).where('dtremoved IS NULL').first().callback($);	
	}
});


// REMOVE
NEWACTION('Samples/remove', {
	name: 'Remove Sample',
	permissions: 'samples',
	input: `id:Number`,
	action: async function ($, model) {
		DATA.remove(`public.tbl_sample`).id(model.id).callback($);
	}
});

// SAVE
NEWACTION('Samples/save', {
	name: 'Update Sample',
	permissions: 'samples',
	input: `id:Number, name:String, countupdate:Number, createdbyid:Number, updatedbyid:Number, removedbyid:Number`,
	action: async function ($, model) {

		({id, model, userid} = await FUNC.prepare($, model));

		model.dtupdated = NOW;
		model.updatedbyid = userid;

		DATA.modify(`public.tbl_sample`, model, true).where('id', id).insert(function (doc) {
			doc.dtcreated = NOW;
			doc.createdbyid = userid;
		}).primarykey('id').callback(function (err, res) {

			if (err) {
				$.invalid(err);
				printerr("Error saving sample", err, model);
				return;
			}
			
			let response = {};
			if (id)
				response.id = id;
			else 
				response.id = res;

			$.callback(response);
		});
	}
});

