COMPONENT('cmsbox','', function(self, config, cls) {

	var cls2 = '.' + cls;

	self.make = function() {
		self.event('click', `${cls2}-translate`, function (event) {
			var opt = {};
			opt.element = $(this);

			opt.items = [
				{ name: 'Translate', id: 'translate' },
				{ name: 'Add translation', id: 'add' },
				{ name: 'Remove translation', id: 'remove' }
			];

			opt.callback = function(value) {
				switch (value.id) {
					case 'translate':
						SET('common.form2', 'formpagetranslate');
						EXEC('formpagetranslate/init');

						SET('formpagetranslate', {
							callback: (res) => { self.translate(res.fromlangcountry, res.tolangcountries, { onlynew: res.onlynew, partialtranslate: res.partialtranslate }); },
							fromlangcountry: self.get()?.prevlangcountryid,
						});
						break;

					case 'add':
						setTimeout(() => {self.addvariations(opt.element);}, 300);						
						break;

					case 'remove':
						setTimeout(() => {self.removevariations(opt.element);}, 300);
						break;
				}

			};

			SETTER('directory/show', opt);
		});

		self.event('click', `${cls2}-settings`, function (event) {

			self.savehtml();
			let model = self.get();
			const callback = function (res) {
				let model = self.get();
				Object.assign(model, res);
				self.set(model);
			};

			SET('common.form2', 'formboxsettings');
			SET('formboxsettings', { name: model.name, isbanner: model.isbanner, iscontainer: model.iscontainer, ishalfcontainer: model.ishalfcontainer, globallangcountryid: model.globallangcountryid, box_variants: model.box_variants, isreplacewithglobal:model.isreplacewithglobal,  callback: callback });
		});
	};

	self.removevariations = function (el) {
		let box = self.get();
		let variants = box.box_variants;
		
		let langcountries = variants?.map((item) => ({ name: item.langcountryid, id: item.langcountryid }));
		
		var opt = {};
		opt.element = el;
		opt.items = langcountries;
		opt.callback = function (value) {
			variants = variants.remove('langcountryid', value.id);
			self.set('box_variants', variants);
			self.update();
		};
		SETTER('directory/show', opt);
	};
	
	self.addvariations = function (el) {
		let box = self.get();
		let variants = box.box_variants;

		var opt = {};
		opt.element = el;

		if (!variants)
			variants = [];
		
		opt.items = DEF.langcountries?.map((item) => ({ name: item.id, id: item.id }))?.filter((item) => !variants.findItem('langcountryid', item.id));
		
		opt.callback = function (value) {
			variants.push({ langcountryid: value.id, html: '' });
			// self.set('box_variants', variants);
			self.update();
		};
		
		SETTER('directory/show', opt);
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'boxlangcountryid':
				self.datasource(value, self.langcountry);
				break;
		}
	};

	self.setter = function (value, path2, type) {
		console.log('update', value);
		if (!value.box_variants) {
			value.box_variants = [];
		}
	};

	self.langcountry = function (path, value) {

		let box = self.get();
		let variants = box.box_variants;
		
		self.savehtml();

		let variant = variants ? variants.findItem('langcountryid', value) : null;

		if (!variant)
			return;

		box.html = { type: 'html', html: '' };
		box.html.html = variant.html;
		UPD(self.path + '.html');
		
		box.prevlangcountryid = value;
	};


	// fresh iframe with from actual value in box_variant
	self.refreshiframe = function () {
		let box = self.get();
		let variant = box.box_variants.findItem('langcountryid', box.prevlangcountryid);

		if (!variant)
			return;

		box.html = { type: 'html', html: variant.html };
	};

	self.savehtml = function () {

		let box = self.get();
		
		let variants = box.box_variants;
		let prevlangcountryid = box.prevlangcountryid;

		if (prevlangcountryid) {
			let prev = variants.findItem('langcountryid', prevlangcountryid);
			if (box.editor) {
				let html = box.editor.response();
				let result = FUNC.numberelements(html, box.maxelementnumber);

				prev.html = result.html;
				box.maxelementnumber = result.maxelementnumber;

				// TODO make generate confis for all variants;
				prev.configs = box.editor.getconfigs(prev.html);
				box.html.html = prev.html;
			}
		}
	};

	self.translate = async function (fromlangcountry, tolangcountries, config = {}) {
		
		self.savehtml();

		let model = self.get();
			
		let model2 = Object.assign({}, model);

		delete model2.editor;
		
		let obj = {
			maxelementnumber: model.maxelementnumber || 0,
			fromlangcountryid: fromlangcountry,
			tolangcountryids: tolangcountries,
			content: model2.box_variants,
			onlynew: config?.onlynew,
			partialtranslate: config?.partialtranslate,
		};
		

		TAPI('pages_content_translate', obj, function (response) {

			({ maxelementnumber, content } = response);
			model.maxelementnumber = maxelementnumber;

			content.wait(function (v, next) {
				let langcountryid = v.langcountryid;

				let variant = model.box_variants.findItem('langcountryid', langcountryid);

				if (v.html)	
					v.html = v.html.replace('cms_translate', '');

				if (variant)
					variant.html = v.html;
				else {
					model.box_variants.push({ langcountryid: langcountryid, html: v.html });
				}

				next();
			}, function () {
				self.refreshiframe();
				self.update();
			});
		});
	};

});



