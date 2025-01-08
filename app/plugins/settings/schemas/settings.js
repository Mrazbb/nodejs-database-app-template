NEWACTION('Settings/read', {
	name: 'Read settings',
	permissions: 'settings',
	action: async function($) {

		var model = {};
		var language = $.user.language;

		let db = DBMS();

		let config = await db.find('public.tbl_config').promise();

		for (var i = 0; i < config.length; i++) {
			var item = config[i];
			var key = item.id;
			var val = item.value;
			switch (item.type) {
				case 'number':
					model[key] = +val;
					break;
				case 'boolean':
					model[key] = val === 'true';
					break;
				case 'object':
					model[key] = val.parseJSON();
					break;
				case 'array':
					model[ key ] = item.value_array;
					break;
				default:
					model[key] = val;
					break;
			}
		}

		model.items = [];

		for (let key in F.plugins) {

			let plugin = F.plugins[key];
			let cfg = plugin.config;

			if (cfg) {
				var name = TRANSLATE(language, plugin.name);
				model.items.push({ type: 'group', name: name });
				for (let m of cfg) {
					var type = m.type;
					if (!type) {
						if (m.value instanceof Date)
							type = 'date';
						else
							type = typeof(m.value);
					}
					var item = CLONE(m);
					item.name = TRANSLATE(language, m.name);
					item.value = CONF[m.id];
					item.type = type;
					model.items.push(item);
				}
			}

		}
		
		// if (!model.smtp)
		// 	model.smtp = JSON.stringify({ server: 'yourserver.com', from: 'info@totaljs.com', user: '', password: '', port: 22 });

		$.callback(model);
	}
});

NEWACTION('Settings/save', {
	name: 'Save settings',
	input: 'name:String, url:URL, order_create_page:number, order_info_page:number, defaultcurrency:String, cart_page:number, stripe_secret_token:String, stripe_public_token:String, defaultwatermarkuid:String, stripe_hook_token:String, smtp:String, icon:String, $tms:Boolean, secret_tms:String, op_reqtoken:String, op_restoken:String, eshop_op_reqtoken:String, eshop_op_restoken:String, totalapi:String, defaultlangid:String, defaultlangcountryid:String, defaultlangcountrypage:String, isenabledcache:boolean, items:[*id:String, value:Object], error400structureid:number, error401structureid:number, error403structureid:number, error404structureid:number',
	permissions: 'settings',
	action: async function($, model) {
		
		for (let m of model.items) {

			if (m.value instanceof Date) {
				m.value = m.value.toISOString();
				m.type = 'date';

			} else {
				if (m.value == null) {
					m.value = '';
					m.type = 'string';

				} else {
					var type = typeof(m.value);
					if (type === 'object') {
						type = 'json';
						m.value = JSON.stringify(m.value);
					} else
						m.value = m.value == null ? '' : m.value.toString();
					m.type = type;
				}
			}
			
			m.dtupdated = NOW;
			model[m.id] = m.value;
		}

		for (var key in model) {
			if (key !== 'items') {
				var type = typeof (model[ key ]);
				
				let db = DBMS();
				await db.update('public.tbl_config', {id: key , type:typeof (model[key]), value: model[key] }, true).where('id', key).promise();
			}
		}

		FUNC.reconfigure();
		FUNC.save();

		$.success();
	}
});

NEWACTION('Settings/test', {
	name: 'Test SMTP settings',
	input: '*smtp:JSON',
	permissions: 'settings',
	action: async function($, model) {
		var options = model.smtp.parseJSON();
		Mail.try(options, $.done(true));
	}
});