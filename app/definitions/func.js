const PARSER = { settings: '<settings>', css: '<style>', total: '<script total>', html: '<body>', js: '<script>', template: '<template>', templates: '<templates>', ttemplate: '<ttemplate>', readme: '<readme>' };
const PARSER_LAYOUT = { total: '<script total>' };
const REG_CLASS = /CLASS/g;
const fs = require('fs');

// first time init
FUNC.init_load = function () {
	MAIN.cache = {
		widgets: [],
		layouts: [],
		dependencies: '',
		views: {},
		languages: {},
		countries: {},
	};

	MAIN.schedulers = {};
	
	FUNC.load();

};

FUNC.load = async function(callback) {

	EMIT('refresh_content');

	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (item.config) {
			for (let m of item.config) {
				if (MAIN.db.config[m.id] == null)
					MAIN.db.config[m.id] = m.value;
			}
		}
	}

	FUNC.reconfigure();
	callback && callback();
};


// TODO remove
FUNC.save = function() {
	var site = MAIN.db;
	var model = {};
};

// TODO remove
FUNC.unload = function(callback) {
	var value = MAIN.db;

	EMIT('unload');
};

FUNC.reconfigure = async function() {
	var config = {};
	let obj = await DATA.find('public.tbl_config').promise();

	for (let m of obj) {
		config[m.id] = m.value;
	}


	LOADCONFIG(config);
	EMIT('configure');
};

FUNC.refresh = async function() {
	MAIN.cache = {};
};

FUNC.userid = async function ($) {

	if (!$?.user?.id)
		return null;
		
	let user = await DATA.find('public.tbl_user').where('useropid', $?.user?.id).first().promise();

	if (!user) {
		let id = await DATA.insert('public.tbl_user', { useropid: $?.user?.id, name: $?.user?.name  }).primarykey('id').promise();
		return id;
	}
	
	return user.id;
}


FUNC.prepare = async function ($, model) {

	let id = model.id;
	delete model.id;
	if (!id) id = null;

	let userid = await FUNC.userid($);

	return {id, model, userid};
}
