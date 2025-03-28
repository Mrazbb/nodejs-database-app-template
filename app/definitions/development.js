let fs = require('fs');
let path = require('path');


ON('ready', function () {

    let lastrunned = new Date().getTime();
	// ONLY DEVELOPMENT
	if(process.env.NODE_ENV == 'development') {
				
		fs.watch(PLUGINS.layouts.path(), { recursive: true }, async (eventType, filename) => {
			
			if (lastrunned + 300 > new Date().getTime()) {
				return;
			}
			
			lastrunned = new Date().getTime();

			let id = filename.replace(/\.html/i, '');
			await FUNC.load_layouts([id]);
			EMIT('refresh_content');

		});

		fs.watch(PLUGINS.widgets.path(), { recursive: true }, async (eventType, filename) => {

			if (lastrunned + 300 > new Date().getTime()) {
				return;
			}
			
			lastrunned = new Date().getTime();
			console.log('Widgets changed', filename);

			let id = filename.replace(/\.html/i, '');
			await FUNC.load_widgets([ id ]);
			await ACTION('Pages/ContentProcessing', { widgets: [ id ], prerender:true }).user({ sa: true }).promise();
			EMIT('refresh_content');
		});

		fs.watch(PATH.root('components'), { recursive: true }, async (eventType, filename) => {
			
			if (lastrunned + 300 > new Date().getTime()) {
				return;
			}
			
			lastrunned = new Date().getTime();

			console.log('Components changed', filename);
			await FUNC.load_components();
			EMIT('refresh_content');
		});



	}
});

FUNC.load_components = async function (ids) {

	const componentspath = PATH.root('components');


    const components = fs.readdirSync(componentspath);
    
    let ui_js = '';
    let ui_css = '';
    
    for (let i = 0; i < components.length; i++) {
        const component = components[ i ];
        const stat = fs.statSync(path.join(componentspath, component));
        if (stat.isDirectory()) {
            const componentpath = path.join(componentspath, component);
            const componentcontent = fs.readdirSync(componentpath);

            if (componentcontent.includes('component.js')) {
                ui_js += fs.readFileSync(path.join(componentpath, 'component.js'), 'utf8');
            }        
            if (componentcontent.includes('component.css')) {
                ui_css += fs.readFileSync(path.join(componentpath, 'component.css'), 'utf8');
            }
        }
        
    }        
    let note = '/* This file is generated by the script in definitions/core/components.js */\n'; 
    ui_js = note + ui_js + note;
	fs.writeFileSync(PATH.root('public/admin-ui.js'), ui_js);
	fs.writeFileSync(PATH.root('public/admin-ui.css'), ui_css);
}



ON('ready', async function () {
	FUNC.load_components();
});

