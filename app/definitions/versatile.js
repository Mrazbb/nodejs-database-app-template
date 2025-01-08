
FUNC.normalize_url = function (value) {
	value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	value = value.toLowerCase();
	value = value.replace(/\s+/g, '-');
	value = value.replace(/[<>[\]{}()|\\^='"`,.?„“]/g, '');
	value = value.replace(/-+/g, '-');
	return value;
};

FUNC.normalize_id = function (value) {
	value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	value = value.toLowerCase();
	value = value.replace(/\s+/g, '-');
	value = value.replace(/[^a-z0-9-]/gi, '');
	return value;
};

FUNC.sanitaze_id = function (value) {
	return value.replace(/[^a-zA-Z0-9-]/gi, '');
};

FUNC.sleep = async function (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
};

