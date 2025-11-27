NEWACTION('Dependencies|load', {
    name: 'Load dependencies',
    permissions: 'pages',
    route: '+API    ?',
    action: async function ($) {

        let promises = []
        let obj = {};

        promises.push(DATA.find('cl_structure_type').sort('order2').promise().then(res => ({ res: res, name: 'structuretypes', translate: true, translate_field:['name'] })));
        promises.push(DATA.find('cl_section_type').sort('order2').promise().then(res => ({ res: res, name: 'sectiontypes', translate: true, translate_field:['name'] })));
        promises.push(DATA.find('localization.view_language').where('id', '!=', 'default').promise().then(res => ({ res: res, name: 'languages', translate: true, translate_field: [ 'name' ] })));
        promises.push(DATA.find('localization.view_country').promise().then(res => ({ res: res, name: 'countries', translate: true, translate_field: [ 'name' ] })));
        promises.push(DATA.find('localization.view_lang_country').sort('order2').sort('id').promise().then(res => ({ res: res, name: 'langcountries' })));
        promises.push(DATA.find('localization.cl_resource_type').promise().then(res => ({ res: res, name: 'resourcetypes' })));
        promises.push(DATA.find('cl_banner_apply_type').promise().then(res => ({ res: res, name: 'bannerapplytypes'})));
        promises.push(DATA.find('tbl_layout').fields('id,name,author,dtcreated,dtupdated').sort('name').promise().then(res => ({ res: res, name: 'layouts' })));
        promises.push(DATA.find('tbl_flag').sort('name').promise().then(res => ({ res: res, name: 'flags' })));
        promises.push(DATA.find('files.tbl_watermark').sort('filename').promise().then(res => ({ res: res, name: 'watermarks' })));
        promises.push(DATA.find('localization.view_currency').promise().then(res => ({ res: res, name: 'currencies' })));
        promises.push(DATA.find('eshop.tbl_delivery_option').promise().then(res => ({ res: res, name: 'deliveryoptions' })));
        promises.push(DATA.find('eshop.cl_order_status').promise().then(res => ({ res: res, name: 'orderstatuses' })));
        promises.push(DATA.find('eshop.cl_order_payment_status').promise().then(res => ({ res: res, name: 'orderpaymentstatuses' })));
        promises.push(DATA.find('eshop.cl_payment_type').promise().then(res => ({ res: res, name: 'paymenttypes' })));
        
        
        // CONFIG
        promises.push(DATA.find('public.tbl_config').or(function (builder) {
            builder.where('id', 'defaultlangid');
            builder.where('id', 'defaultlangcountryid');
        }).promise().then(res => ({ res: res, name: 'config' })));
        

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

            // TRANSLATE
            // if (item.translate) {

            //     item.res.forEach(function (child) {

            //         if (item.translate_field && item.translate_field.length) {

            //             item.translate_field.forEach(function (column) {
            //                 console.log(child[ column ]);
            //                 child[ column ] = TRANSLATE($.language, `${child[ column ]}`);
            //             });
            //         };
            //     });
            // }
        });
        
        $.callback(obj);
    }
});


