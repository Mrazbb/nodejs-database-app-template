COMPONENT('langgallery', 'languageinput:false', function(self, config, cls) {

    var cls2 = '.' + cls;
    var open = [];
    var ready = false;

    self.make = function () {
        self.aclass(cls);
        self.append(`<div style="display:flex;flex-wrap:wrap;"> <button class="${cls}-upload" style="margin: 10px;">Upload</button> </div>`);
        self.append(`
			<ui-component name="movable" config="selector:.${cls}-container;">
                <div class="${cls}-main-container" style="display:flex;flex-wrap:wrap;justify-content:flex-start;align-items:center; "></div>
            </ui-component>
            <ui-plugin path="langgalleryinput${self.id}" config="isolated:true" class="hidden">
                <div class="description-editor">
                    <ui-component name="multilanginput" path="?.resourceid" config="placeholder:Description">@(Name)</ui-component>
                </div>
            </ui-plugin>
            `);
        
    
        self.event('click', cls2 + '-upload', function (e) {
            e.preventDefault();
            self.upload();
        });

        self.event('click', cls2 + '-delete', function (e) {
            e.preventDefault();
            let el = $(this).closest(cls2 + '-container');
            let scopeid = el.attrd('scopeid');
            self.remove(scopeid);
        });

        self.event('click', cls2 + '-container', function (e) {
            e.preventDefault();
            let el = $(this);
            let scopeid = el.attrd('scopeid');
            self.select(scopeid);
        });


        self.event('click', cls2 + '-settings', function (e) {
            e.preventDefault();
            let el = $(this).closest(cls2 + '-container');
            let scopeid = el.attrd('scopeid');
            let obj = self.get(config.datasource).findItem(x => x.scopeid() === scopeid);
            
            var opt = {};
            opt.element = $(this);
            opt.items = [];

            if (obj.iswatermarked) {
                opt.items.push({ id: 'removewatermark', name: 'Remove Watermark' });
            } else {
                opt.items.push({ id: 'addwatermark', name: 'Add Watermark' });
            }
            

            opt.callback = function (value) {
                
                let id = value?.id;
                if (id === 'addwatermark') {
                    obj.iswatermarked = true;
                    self.update();
                } else if (id === 'removewatermark') {
                    obj.iswatermarked = false;
                    self.update();
                }
            };

            SETTER('directory/show', opt);
        });


        // check drag and drop event
        self.event('dragend', cls2 + '-container', function (e) {

            setTimeout(() => {
                self.check_order();
            }, 1000);
        });
    };
    
    self.check_order = function () {
        let list = $(self.find(cls2 + '-main-container')).children();
        let pictures = self.get();
        let new_order = [];
        pictures = CLONE(pictures);
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let id = $(item).attrd('id');
            let picture = pictures.find(p => p.id === id);
            new_order.push(picture);
        };
        self.set(new_order);
        self.update();
    };

    self.insert = function (obj, show, callback) {
        

        if (open.indexOf(obj) !== -1)
            return;

        var scopeid = 'longgallery' + GUID(10);

        obj.scopeid = function() {
            return scopeid;
        };
        SET('scopeid', obj);
        self.find(cls2 + '-main-container').append(self.templatesettings({...obj, scopeid: obj.scopeid() }));

        W[scopeid] = obj;
        open.push(obj);
        // show && self.set(obj);
        callback && callback(obj);
    };

    self.add = function(scopeid) {
        let obj = self.get(config.datasource).findItem(x => x.scopeid() === scopeid);
        config.add && self.EXEC(config.add, obj);
    };

    self.remove = function(scopeid) {

        let obj = self.get(config.datasource).findItem(x => x.scopeid() === scopeid);
        let arr = self.get(config.datasource);

        let index = arr.indexOf(obj);
        if (index > -1) {
            arr.splice(index, 1);
        }

        self.update(config.datasource);
        config.remove && self.EXEC(config.remove, obj);
    };

    self.select = function (scopeid) {

        self.find(cls2 + '-container').rclass('selected');
        self.find(cls2 + '-container[data-scopeid="{0}"]'.format(scopeid)).aclass('selected');
        let obj = self.get(config.datasource).findItem(x => x.scopeid() === scopeid);
        SET('langgalleryinput' + self.id, obj);
        CHANGE(self.path);
    };

    
    self.configure = function (key, value) {

        console.log(key, value);
        switch (key) {
            case 'languageinput':
                if (value == 'true' || value == '1')
                    self.find('ui-plugin').rclass('hidden');
                else 
                    self.find('ui-plugin').aclass('hidden');
                break;
        }
    };

    self.loadfilemetadata = async function(images = []) {

        if (!images.length) return;
        ids = images.map(image => image.id);
        let promise = new Promise((resolve, reject) => {
            TAPI('files_list', { fileids: ids }, function(response, err) {
                let new_response = [];
                for (let i = 0; i < ids.length; i++) {
                    let file = response.find(f => f.fileid === ids[ i ]);
                    if (file) {
                        new_response.push(file);
                    }
                }
                resolve(new_response);
            });
        });
        return promise;
    };

    self.upload = function(files) {
        var opt = {};
        opt.url = '[upload]';
        opt.multiple = true;
        opt.accept = 'image/*';
        opt.callback = function(response) {
            for (let m of response) {
                self.push(m);
            };
            self.change(true);
            self.update();
        };
        SETTER('fileuploader/upload', opt);
    };

    self.setter = async function (path, arr) {
        
        if (typeof(path) === 'object')
            arr = path;

        if (arr == null || typeof (arr) == 'string')
            arr = [];

        let files = await self.loadfilemetadata(arr);

        arr = arr.map((item, index) => {
            delete files?.[ index ]?.id;
            item = Object.assign(item, files[ index ]);
            item.id = item.fileid;            
            item.url = `/download/${item.id}.${item.ext}`;
            return item;
        });

        var cache = {};

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];

            if (open.indexOf(item) === -1) {
                !item[config.orderkey] && (item[config.orderkey] = 0);
                self.insert(item, null, function(item) {
                    cache[item.scopeid()] = 1;
                    setTimeout2(self.ID + 'compile', COMPILE, 100);
                });
            } else {
                cache[item.scopeid()] = 1;
            }
        }

        var remove = [];

        for (var i = 0; i < open.length; i++) {
            var item = open[i];
            var sn = item.scopeid();
            if (cache[sn])
                continue;
            else
                remove.push(item);
        }

        for (var i = 0; i < remove.length; i++) {
            var item = remove[i];
            var sn = item.scopeid();
            open = open.remove(item);
            let el = self.find(cls2 + '-container[data-scopeid="{0}"]'.format(sn));
            el.remove();
            delete W[sn];
        }

        remove.length && FREE();

        if (!ready) {
            ready = true;
            self.refresh();
            self.rclass('invisible');
        }

        // update watermark div
        for (var i = 0; i < arr.length; i++) {
            let item = arr[ i ];
            let el = self.find(cls2 + '-container[data-scopeid="{0}"]'.format(item.scopeid()));
            if (item.iswatermarked) {
                el.find(cls2 + '-watermark').rclass('hidden');
            } else {
                el.find(cls2 + '-watermark').aclass('hidden');
            }
        }

    };

    self.templatesettings = Tangular.compile(`
        <div data-src="{{url}}" data-id="{{id}}" data-scopeid="{{scopeid}}" class="dragme picture-box ${cls}-container" draggable="true" style="">
            <ui-plugin path="{{scopeid}}" config="isolated:true" style="">

                <div style="display: flex; justify-content: end; gap: 5px; }">

                    <div class="${cls}-watermark hidden " style="cursor: pointer;">
                        <i class="fa-solid fa-signature"></i>
                    </div>

                    <div class="${cls}-settings" style="cursor: pointer;">
                        <i class="fa-solid fa-gear"></i>
                    </div>

                    <div class="${cls}-delete" style="cursor: pointer;">
                        <i class="fa fa-times" style="color: red;"></i>
                    </div>
                </div> 
                <img src="{{url}}" style="object-fit: cover; width: 100%;">
                (<ui-bind path="?.resourceid" config="text:value"></ui-bind>)
                <ui-bind path="?.name" config="text:value"></ui-bind>
            </ui-plugin>
        </div>
    `);

});