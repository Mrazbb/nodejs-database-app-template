exports.icon = 'ti ti-laptop';
exports.name = '@(Movies)';
exports.position = 2;
exports.visible = () => true; 

exports.install = function() {
	ROUTE('+API    ?    -movies_list                --> Movies/list');
	ROUTE('+API    ?    -movies_read                --> Movies/read');
	ROUTE('+API    ?    -movies_save                --> Movies/save');

};
