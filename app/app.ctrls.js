app.controller("formForm", ['Soil', function(Soil){
	var test = this;
	this.saveData = function(formTitle){
		var formId = formTitle.replace(/[^a-z0-9]/gi, '');
		var newIds = Soil.data('a', 'a', 'a', 'form', 'formTitle', 'a');
		test.formTitle = '';
	}
}]);