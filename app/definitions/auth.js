const ADMIN = { id: 'admin', sa: true, name: 'Admin', permissions: [] };
const BOT = { id: 'bot', sa: true, name: 'Bot', permissions: [] };

AUTH(function($) {
	var path = $.split[0];
	if (path === 'admin') {
		var bearertoken = $.headers['authorization']?.split(' ')?.[1];

		var token = $.headers['x-token'];

		if (token) {
			if (BLOCKED($, 10)) {
				$.invalid();
				return;
			}

			if (token === CONF.token) {
				BLOCKED($, -1);
				$.success(BOT);
			}
		} else if (bearertoken === CONF['api_token_' + CONF.app_type]) {
			
			BLOCKED($, -1);
			$.success(BOT);

		// if it is configured to use OpenPlatform
		} else if (CONF.op_reqtoken && CONF.op_restoken)
			OpenPlatform.auth($);
		else if (FUNC.authadmin)
			FUNC.authadmin($);
		
		// without configuration
		else
			$.success(ADMIN);

	} else {
		if (FUNC.auth)
			FUNC.auth($);
		else
			$.invalid();
	}
});


