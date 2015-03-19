app.controller("formForm", ['Soil', function(Soil){
	var test = this;
	this.saveData = function(title){
		//var formId = formTitle.replace(/[^a-z0-9]/gi, '');
		Soil.data('a', 'a', 'a', 'form', 'formTitle', 'a');
		test.formTitle = '';
	}
}]);