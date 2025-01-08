COMPONENT('lister','orderkey:order', function(self, config, cls) {

	var cls2 = '.' + cls;
	var open = [];
	var ready = false;
	var templates = {};

	self.readonly();

	self.make = function() {

		var tmp = self.find('script');

		for (var i = 0; i < tmp.length; i++) {
			var name = tmp[i].getAttribute('data-id') || 'default';
			templates[name] = { url: tmp[i].getAttribute('data-url'), html: tmp[i].innerHTML.trim().replace(/SCR/g, 'scr' + 'ipt') };
		}

		tmp.remove();
		self.aclass(cls);

		self.event('click', `${cls2}-up`, function (event) {
			self.move($(event.target).closest(cls2 + '-container').attr('data-id'), 'up');	
		});
		
		self.event('click', `${cls2}-down`, function (event) {
			self.move($(event.target).closest(cls2 + '-container').attr('data-id'), 'down');	
		});

		self.event('click', `${cls2}-remove`, function (event) {
			SETTER('approve/show', 'Are you sure you want to remove current box', '"ti ti-trash" @(Remove)', function () {
				let id = $(event.target).closest(cls2 + '-container').attr('data-id');
				self.remove(id);
			});
		});

		self.event('click', `${cls2}-add`, function (event) {
			let id = $(event.target).closest(cls2 + '-container').attr('data-id');
			self.add(id);
		});
	};
	
	self.configure = function(key, value) {
		switch (key) {
			case 'datasource':
				self.datasource(value, self.rebind);
				break;
			case 'url':
				AJAX('GET ' + value, function (response) {
					if (typeof (response) === 'string')
						templates.default = response.trim();
				});
				break;
			
		}
	};

	self.insert = function(obj, show, callback) {

		if (open.indexOf(obj) !== -1)
			return;

		var template = templates[obj.template || 'default'];

		// Template not found
		if (!template)
			return;

		if (template.url) {
			AJAX('GET ' + template.url, function(response) {
				template.url = '';
				template.html = response || '';
				self.insert(obj, show);
			});
			return;
		}

		var scope = 'lister' + GUID(10);

		obj.scopename = function() {
			return scope;
		};

		let boxesbefore = open.filter(box => box[ config.orderkey ] <= obj[ config.orderkey ]);
		let boxbefore = boxesbefore.reduce((maxObj, currentObj) => { return (currentObj[ config.orderkey ] > maxObj[ config.orderkey ]) ? currentObj : maxObj; }, boxesbefore[ 0 ]);
		let html = `<div data-scope="{0}__isolated:true" data-id="{0}" class="{2}-container ">{1}</div>`.format(scope, template.html, cls);

		// first
		if (obj[ config.orderkey ] === 0) {
			$(self.element).prepend(html);

		// last
		} else if (!boxbefore) {
			self.append(html);

		// middle
		} else {
			let el = self.find(cls2 + '-container[data-id="{0}"]'.format(boxbefore.scopename()));
			el.after(html);
		}

		W[scope] = obj;
		open.push(obj);
		show && self.set(obj);
		callback && callback(obj);
	};

	self.checkorder = function() {
		let elements = self.element.find('>');
		let array = self.get(config.datasource);
		for (let i = 0; i < elements.length; i++) {
			let el = $(elements[i]);
			let id = el.attr('data-id');
			let item = array.findItem(x => x.scopename() === id);
			
			if (item) {
				item[config.orderkey] = i;
			}
		}
	};

	self.move = function (id, direction) {

		let el = self.find(cls2 + '-container[data-id="{0}"]'.format(id));
		$(el).FIND('cmsbox').savehtml();

		let boxes = self.get(config.datasource);
		let box = boxes.findItem(x => x.scopename() === id);
		let index = boxes.indexOf(box);

		if ((index === 0 && direction === 'up') || (index === boxes.length - 1 && direction === 'down')) {
			console.log('cannot move');
			return;
		}

		delete box.prevlangcountryid;
		self.remove(id);

		if (direction === 'up') {
			boxes.splice(index - 1 , 0, box);
		} else {
			boxes.splice(index + 1, 0, box);
		}
		boxes.forEach(function (box, index) {
			box[ config.orderkey ] = index;
		});
		
		UPD('formpage.boxes')
	};

	
	self.add = function(id) {
		let obj = self.get(config.datasource).findItem(x => x.scopename() === id);
		config.add && self.EXEC(config.add, obj);
	};
	
	self.remove = function(id) {

		let obj = self.get(config.datasource).findItem(x => x.scopename() === id);
		let arr = self.get(config.datasource);

		let index = arr.indexOf(obj);
		if (index > -1) {
			arr.splice(index, 1);
		}
		
		self.find(cls2 + '-container[data-id="{0}"]'.format(id)).remove();
		open = open.remove(obj);
		
		self.update(config.datasource);
		config.remove && self.EXEC(config.remove, obj);
	};

	self.rebind = function(path, arr) {

		if (!Object.keys(templates).length) {
			setTimeout(self.rebind, 500, path, arr);
			return;
		}

		if (typeof(path) === 'object')
			arr = path;

		if (arr == null)
			return;

		var cache = {};

		arr.sort((a, b) => (a[config.orderkey] || 0) - (b[config.orderkey] || 0));

		for (var i = 0; i < arr.length; i++) {
			var item = arr[i];
			if (open.indexOf(item) === -1) {
				!item[config.orderkey] && (item[config.orderkey] = 0);
				self.insert(item, null, function(item) {
					cache[item.scopename()] = 1;
					setTimeout2(self.ID + 'compile', COMPILE, 100);
				});
			} else {
				cache[item.scopename()] = 1;
			}
		}

		var remove = [];

		for (var i = 0; i < open.length; i++) {
			var item = open[i];
			var sn = item.scopename();
			if (cache[sn])
				continue;
			else
				remove.push(item);
		}

		for (var i = 0; i < remove.length; i++) {
			var item = remove[i];
			var sn = item.scopename();
			open = open.remove(item);
			self.find(cls2 + '-container[data-id="{0}"]'.format(sn)).remove();
			delete W[sn];
		}

		remove.length && FREE();

		if (!ready) {
			ready = true;
			self.refresh();
			self.rclass('invisible');
		}

		self.checkorder();
	};

	self.setter = function(value) {

		if (!ready)
			return;

		var arr = self.find(cls2 + '-container');
		var scope = value && value.scopename ? value.scopename() : '';
		var target = null;

		for (var i = 0; i < arr.length; i++) {
			var el = $(arr[i]);
			var s = el.attrd('id');

			// TODO FOCUS
			// 
			if (s === scope)
				target = el;
			else {
			}
		}

		target && target.rclass('hidden');
	};

});