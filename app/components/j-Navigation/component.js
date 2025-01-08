COMPONENT('navigation', function (self, config, cls) {

    var dragdrop, language;
    var cls2 = '.' + cls;

    self.template = Tangular.compile('<div data-id="{{ id }}" class="ui-navigation-itemcontainer" draggable="true"><div class="ui-navigation-item"><i class="fa fa-times remove"></i><i class="fa fa-pencil edit"></i><i class="fa fa-plus-circle plus"></i><i class="fa fa-arrow-right right-direction"></i><i class="fa fa-arrow-left left-direction"></i><i class="icon{{ if icon }} {{ icon }}{{ fi }}"></i><span class="language">{{ language }}</span><div class="name">{{ name }}<span> {{ if isinternal }} <i class= "fa fa-home mr5" ></i > {{ else }} <i class= "fa fa-globe mr5" ></i> {{ fi }} {{ url }}</span ></div ></div > {{ if children && children.length }}<div class="ui-navigation-children">{{ children | navigationchildren($.template)}}</div>{{ fi }}</div >');	
    self.novalidate();
    self.nocompile();
    self.getter = null;

    self.make = function() {
        self.aclass(cls);

        self.event('click', '.fa', function() {
            var el = $(this);
            var id = el.closest(cls2 + '-itemcontainer').attrd('id');

            if (el.hclass('edit')) {
                var item = self.finditem(id, self.get());
                config.edit && SEEX(config.edit, item);

            } else if (el.hclass('remove')) {
                
                var item = self.finditem(id, self.get());
                var index = item.children.indexOf(item.item);
                item.children.splice(index, 1);
                self.update();
                self.change(true);

            } else if (el.hclass('plus')) {
                var item = self.finditem(id, self.get());
                var obj = {};
                !item.item.children && (item.item.children = []);
                obj.$target = item.item.children;
                obj.behaviour = 'default';
                obj.target = '_self';
                SETR('navigationitemform', obj);
                SET('common.form2', 'navigationitemform');

            } else if (el.hclass('right-direction')) {
                
                var item = self.finditem(id, self.get());
                var index = item.children.indexOf(item.item);

                if (index) {
                    var obj = item.children[index];
                    item.children.splice(index, 1);
                    if (!Array.isArray(item.children[index-1].children)){
                        item.children[index-1].children = [];
                    }
                    item.children[index-1].children.push(obj);
                    self.update();
                    self.change(true);
                    
                }			
                
            } else if (el.hclass('left-direction')) {

                var item = self.finditem(id, self.get());
                var index = item.children.indexOf(item.item);
                var parent = self.findparent(id ,self.get());

                if (parent) {
                    var parentsiblings = self.finditem(parent.id, self.get());
                    var parentindex = parentsiblings.children.findIndex('id',parent.id);
                    item.children.splice(index,1);
                    parentsiblings.children.splice(parentindex+1,0,item.item);
                    self.update();
                    self.change(true);
                }
            }
        });


        self.event('dragover dragenter dragstart drag drop', cls2 + '-itemcontainer', function(e) {
            switch (e.type) {
                case 'dragstart':
                    dragdrop = $(e.target);
                    if (!dragdrop.hclass(cls + '-itemcontainer'))
                        dragdrop = dragdrop.closest(cls2 + '-itemcontainer');
                    dragdrop.aclass(cls + '-drag');
                    language = dragdrop.closest(cls2 + '-language').attrd('language');
                    e.originalEvent.dataTransfer.setData('text', '1');
                    return;
                case 'drop':
                    dragdrop.rclass(cls + '-drag');
                    var el = $(e.target);

                    if (!el.hclass(cls + '-itemcontainer'))
                        el = el.closest(cls2 + '-itemcontainer');

                    if (!el.length || el.closest(dragdrop).length || el[0] === dragdrop[0] || el.closest(cls2 + '-language').attrd('language') !== language)
                        return;

                    setTimeout2(self.id, function() {
                        self.move(el, dragdrop);
                    }, 50);
                    break;
            }
            e.preventDefault();
        });
    };

    self.move = function(target, dragged) {

        var arr = self.get();
        var a = self.finditem(target.attrd('id'), arr);
        var b = self.finditem(dragged.attrd('id'), arr);

        if (a.children === b.children) {

            // moving in the same array
            var items = b.children;

            var ai = items.indexOf(a.item);
            var bi = items.indexOf(b.item);

            if (ai < bi) {
                items.splice(bi, 1);
                ai = items.indexOf(a.item);
                items.splice(ai, 0, b.item);
            } else {
                items.splice(ai, 1);
                bi = items.indexOf(b.item);
                items.splice(bi, 0, a.item);
            }

        } else {
            // moving between arrays
            b.children.splice(b.children.indexOf(b.item), 1);
            a.children.push(b.item);
        }
        self.update();
    };

    self.finditem = function(id, items) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.id === id)
                return { children: items, item: item };
            if (item.children) {
                item = self.finditem(id, item.children);
                if (item)
                    return item;
            }
        }
    };

    self.findparent = function(id, items) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            if(item.children && item.children.length){
                for (var x = 0; x < item.children.length; x++) {
                    var children = item.children[x];
                    
                    if(children.id === id){
                        return item;
                    } else {
                        item2 = self.findparent(id,item.children);
                        if(item2)
                            return item2;
                    }
                }
            }
        }
    };

    self.setter = function(value) {

        if (!value)
            value = EMPTYARRAY;

        var items = {};
        for (var i = 0, length = value.length; i < length; i++) {
            var item = value[i];
            var key = item.language || '0';
            var val = self.template(item, { template: self.template });
            if (items[key])
                items[key].push(val);
            else
                items[key] = [val];
        }

        var keys = Object.keys(items);
        var builder = [];

        keys.quicksort();

        for (var i = 0; i < keys.length; i++)
            builder.push('<div class="ui-navigation-language" data-language="{0}">{1}</div>'.format(keys[i], items[keys[i]].join('')));

        self.html(builder.length ? builder : '<div class="ui-navigation-empty"><i class="fa fa-ban"></i>@(No items in this navigation)</div>');
    };
    });

    Thelpers.navigationchildren = function(value, template) {
    var builder = [];
    for (var i = 0, length = value.length; i < length; i++) {
        var item = value[i];
        builder.push(template(item, { template: template }));
    }
    return builder.join('');
};