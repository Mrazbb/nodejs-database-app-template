FUNC.generate_url = async function (structureid, langcountryid, isabsoluteurl = false) {
    let url = await DATA.query(`SELECT public.fn_generate_url(${structureid}, '${langcountryid}', ${isabsoluteurl})`).promise();
    if (url?.[0]?.fn_generate_url) {
        return url[0].fn_generate_url;
    } else {
        return '#'
    }
};

FUNC.get_config_page = async function (name, langcountryid) {
    let data = await DATA.find(`public.fn_find_config_page_url('${name}', '${langcountryid}')`).first().promise();
    let url = data?.fn_find_config_page_url;
    return url;
};

FUNC.escapeHTML = function (text) {
    if (typeof text !== 'string') {
        return text;
    }

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => map[char]);
};

FUNC.unescapeHTML = function (text) {
    if (typeof text !== 'string') {
        return text;
    }

    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
    };

    return text.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, (entity) => map[entity]);
};

FUNC.translate_names = async function (languageid, model) {
    for (const key in model) {
        if (key.endsWith('name') && model[key] != null) {
            model[key] = TRANSLATE(languageid, '@(' + model[key] + ')');
        }
    }
    return model;
};

FUNC.convert_currency = async function (amount, from_currency, to_currency) {
	amount = Number(amount || 0) ;
	from_currency = String(from_currency || 'eur').toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
	to_currency = String(to_currency || 'eur').toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
	let rate = await DATA.query(`SELECT eshop.fn_calculate_currency_conversion(${amount}, '${from_currency}', '${to_currency}')`).first().promise();
	return rate?.fn_calculate_currency_conversion || 0;
};



FUNC.pushunique = function (arr, item) {

    if (Array.isArray(item)) {
        for (let i of item) {
            FUNC.pushunique(arr, i);
        }
    } else {
        if (arr.indexOf(item) === -1) {
            arr.push(item);
        }
    }
}

FUNC.userid = async function ($) {

    if (!$?.user?.id)
        return null;

    let user = await DATA.find('public.tbl_user').where('useropid', $?.user?.id).first().promise();

    if (!user) {
        let id = await DATA.insert('public.tbl_user', { useropid: $?.user?.id, name: $?.user?.name }).primarykey('id').promise();
        return id;
    }

    return user.id;
}

FUNC.prepare = async function ($, model) {

    let id = model.id;
    delete model.id;
    if (!id) id = null;

    let userid = await FUNC.userid($);

    return { id, model, userid };
}


ON('ready', async function () {
    await DATA.query(`
		CREATE OR REPLACE FUNCTION fn_get_all_tables_with_columns()
		RETURNS TABLE(
			table_schema TEXT,
			table_name TEXT,
			column_name TEXT,
			data_type TEXT,
			ordinal_position INTEGER
		) AS $$
		BEGIN
			RETURN QUERY
			SELECT
				c.table_schema::TEXT,
				c.table_name::TEXT,
				c.column_name::TEXT,
				c.data_type::TEXT,
				c.ordinal_position::INTEGER
			FROM
				information_schema.columns c
			JOIN
				information_schema.tables t ON c.table_schema = t.table_schema AND c.table_name = t.table_name
			WHERE
				c.table_schema NOT IN ('pg_catalog', 'information_schema')
				AND t.table_type = 'BASE TABLE'
			ORDER BY
				c.table_schema,
				c.table_name,
				c.ordinal_position;
		END;
		$$ LANGUAGE plpgsql;
	`).promise();

	let res = await DATA.query(`SELECT * FROM public.fn_get_all_tables_with_columns()`).promise();

	let tables = {}

	for (let m of res) {
		if (!tables[m.table_name]) {
			tables[m.table_name] = []
		}
		tables[m.table_name].push({
			column_name: m.column_name,
			data_type: m.data_type,
			ordinal_position: m.ordinal_position,
		});
	}

    // define
    if (!MAIN) MAIN = {};
    if (!MAIN.cache) MAIN.cache = {};    
    if (!MAIN.cache.tables_columns) MAIN.cache.tables_columns = {};
    MAIN.cache.tables_columns = tables;

	await DATA.query(`
		CREATE OR REPLACE FUNCTION fn_get_all_views_with_columns()
		RETURNS TABLE(
			view_schema TEXT,
			view_name TEXT,
			column_name TEXT,
			data_type TEXT,
			ordinal_position INTEGER
		) AS $$
		BEGIN
			RETURN QUERY
			SELECT
				c.table_schema::TEXT,
				c.table_name::TEXT,
				c.column_name::TEXT,
				c.data_type::TEXT,
				c.ordinal_position::INTEGER
			FROM
				information_schema.columns c
			JOIN
				information_schema.views v ON c.table_schema = v.table_schema AND c.table_name = v.table_name
			WHERE
				c.table_schema NOT IN ('pg_catalog', 'information_schema')
			ORDER BY
				c.table_schema,
				c.table_name,
				c.ordinal_position;
		END;
		$$ LANGUAGE plpgsql;
	`).promise();

	let res2 = await DATA.query(`SELECT * FROM public.fn_get_all_views_with_columns()`).promise();

	let views = {}

	for (let m of res2) {
		if (!views[m.view_name]) {
			views[m.view_name] = []
		}
		views[m.view_name].push({
			column_name: m.column_name,
			data_type: m.data_type,
			ordinal_position: m.ordinal_position,
		});
	}
    // define
    if (!MAIN) MAIN = {};
    if (!MAIN.cache) MAIN.cache = {};    
    if (!MAIN.cache.views_columns) MAIN.cache.views_columns = {};
	MAIN.cache.views_columns = views;
});

