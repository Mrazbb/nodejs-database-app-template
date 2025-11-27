const ADMIN = { id: 'admin', sa: true, name: 'Admin', permissions: [] };
const BOT = { id: 'bot', sa: true, name: 'Bot', permissions: [] };

CONF.app_type = 'app';

AUTH(function($) {
	var path = $.split[0];
	if (path === 'admin') {
		var bearertoken = $.headers['authorization']?.split(' ')?.[1];

		// token for apps
		if ($.headers['x-token']) {
			console.log('x-token', $.headers['x-token']);

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

		// OpenPlatform
		} else if (CONF.op_reqtoken && CONF.op_restoken) {
			console.log('op');
			OpenPlatform.auth($);
		
		// no token
		} else {
			console.log('no token');
			$.invalid();
		}
		console.log('invalid');
		console.log('CONF.op_reqtoken && CONF.op_restoken', CONF.op_reqtoken , CONF.op_restoken);

	} else {

		if (FUNC.auth)
			FUNC.auth($);
		else
			$.invalid();
	}
});

