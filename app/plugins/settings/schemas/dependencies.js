NEWACTION('Settings/dependencies/load', {
    name: 'Load dependencies',
    action: async function ($) {

        let promises = []
        let obj = {};

        promises.push(DBMS().find('public.tbl_genre').sort('name').promise().then(res => ({ res: res, name: 'genres' })));
        promises.push(DBMS().find('public.tbl_collection').sort('name').promise().then(res => ({ res: res, name: 'collections' })));
        promises.push(DBMS().find('public.tbl_production_company').sort('name').promise().then(res => ({ res: res, name: 'production_companies' })));
        promises.push(DBMS().find('public.tbl_production_country').sort('name').promise().then(res => ({ res: res, name: 'production_countries' })));
        promises.push(DBMS().find('public.tbl_spoken_language').sort('name').promise().then(res => ({ res: res, name: 'spoken_languages' })));

        let response = {};
        try {
            response = await Promise.all(promises);
        } catch (error) {
            $.invalid(error);
            return;
        }
        
        response.forEach((item) => {
            obj[ item.name ] = item.res;

            // CONFIG
            if (item.name === 'config') {
                let config = item.res;
                for (var i = 0; i < config.length; i++) {
                    var item = config[ i ];
                    var key = item.id;
                    var val = item.value;
                    switch (item.type) {
                        case 'number':
                            obj[ key ] = +val;
                            break;
                        case 'boolean':
                            obj[ key ] = val === 'true';
                            break;
                        case 'object':
                            obj[ key ] = val.parseJSON();
                            break;
                        case 'array':
                            obj[ key ] = item.value_array;
                            break;
                        default:
                            obj[ key ] = val;
                            break;
                    }
                };
            }
        });


        for (let lang of obj.spoken_languages) {
            if (lang.name == '') {
                lang.name = lang.id;
            }
        };

        $.callback(obj);
    }
});


