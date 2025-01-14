const REG_META = /<\/head>/;
const REG_AFTER_BODY = /<\/body>/;
const REG_UI = /@\{ui\}/i;
const REG_YEAR = /@\{year\}/i;
const REG_VARS = /\$[a-z0-9A-Z]+/g;
const REG_URL = /(\/(?<langcountryid>\w*))(:?\/?(?<slug>[^\/]+)?)/

CONF.app_type = 'cms';

exports.install = function() {
	ROUTE('GET /*', redirect_to_admin);
	ROUTE('GET /admin/*', admin);
	ROUTE('FILE /frontend/*', files_public);
};

function redirect_to_admin($) {
	$.redirect('/admin/movies');
}

async function files_public ($) {
	let filepath = PATH.root('private/frontend');

	let url = $.url
	let slugs = url.split('/');
	let path = F.path.join(filepath, slugs.slice(2).join('/'));

	$.response.headers['Cache-Control'] = 'public, max-age=86400';

	$.file(path);
};

LOCALIZE(function($) {
    return $.query.language || 'en';
});

function admin($) {

	var plugins = [];

	if ($.user.openplatform && !$.user.iframe && $.query.openplatform) {
		$.cookie(CONF.op_cookie, $.query.openplatform, NOW.add('12 hours'));
		$.redirect($.url);
		return;
	}

	var hostname = $.hostname();

	if (CONF.url !== hostname)
		CONF.url = hostname;

	for (var key in F.plugins) {
		var item = F.plugins[key];
		if (!item.visible || item.visible($.user)) {
			var obj = {};
			obj.id = item.id;
			obj.position = item.position;
			obj.name = TRANSLATE($.user.language || '', item.name);
			obj.icon = item.icon;
			obj.import = item.import;
			obj.routes = item.routes;
			obj.hidden = item.hidden;
			plugins.push(obj);
		}
	}

	$.view('admin', plugins);
}

function variables(text) {
	var val = MAIN.db.vars[text.substring(1)];
	return val == null ? text : val;
}

ON('controller', async function (controller) {
	let user = controller.user;

	// SUPER ADMIN only on this application
	if (user && user.permissions && user.permissions.indexOf('sa') > -1)
		user.sa = true;
	
});



