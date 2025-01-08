FUNC.generate_url = async function (structureid, langcountryid, isabsoluteurl=false) {
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

FUNC.sanitaze_text = async function (text) {

	if (typeof text !== 'string') {
        return text;
    }

	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;',
		'[': '&#91;',
		']': '&#93;',
		'{': '&#123;',
		'}': '&#125;',
		'(': '&#40;',
		')': '&#41;',
	};

	const reg = /[&<>"'/`=]/ig;
    return text.replace(reg, (match) => (map[match]));
};

FUNC.translate_names = async function (languageid, model) {
    for (const key in model) {
		if (key.endsWith('name') && model[ key ] != null) {
            model[key] = TRANSLATE(languageid,'@(' + model[key] + ')');
        }
    }
    return model;
};
