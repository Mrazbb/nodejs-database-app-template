const ADMIN = { id: 'admin', sa: true, name: 'Admin', permissions: [] };
const BOT = { id: 'bot', sa: true, name: 'Bot', permissions: [] };

CONF.app_type = 'app';

ON('ready', function() {
	CONF.op_reqtoken = CONF[CONF.app_type + '_op_reqtoken'] || null;
	CONF.op_restoken = CONF[CONF.app_type + '_op_restoken'] || null;
});

AUTH(function($) {
	var path = $.split[0];
	if (path === 'admin') {
		console.log('admin');
		var bearertoken = $.headers['authorization']?.split(' ')?.[1];

		// x-token for apps
		if ($.headers['x-token']) {

			var token = $.headers['x-token'];
			if (BLOCKED($, 10)) {
				$.invalid();
				return;
			}

			if (token === CONF.token) {
				BLOCKED($, -1);
				$.success(BOT);
			}

		// internal token for apps
		} else if (bearertoken && CONF['api_token_' + CONF.app_type] && (bearertoken === CONF['api_token_' + CONF.app_type])) {
			console.log('bearer', bearertoken);
			BLOCKED($, -1);
			$.success(BOT);

		// if it is configured to use OpenPlatform
		} else if (CONF.op_reqtoken && CONF.op_restoken) {

			console.log('op');
			OpenPlatform.auth($);
			
		// TODO
		// } else if (FUNC.authadmin) {
		// 	console.log('authadmin');
		// 	FUNC.authadmin($);

		} else {
			$.invalid();
		}
		

	} else {

		if (FUNC.auth)
			FUNC.auth($);
		else
			$.invalid();
	}
});

