
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

