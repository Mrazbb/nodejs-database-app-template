exports.icon = 'ti ti-account';
exports.name = '@(Samples)';
exports.position = 2;
exports.visible = () => true; 

exports.install = function() {
	ROUTE('+API    ?    -samples_list                --> Samples/list');
	ROUTE('+API    ?    -samples_read                --> Samples/read');
	ROUTE('+API    ?    -samples_save                --> Samples/save');

};
