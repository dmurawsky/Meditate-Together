app.controller("formForm", ['Soil', function(Soil){
	var test = this;
	this.saveData = function(title){
		var formId = title.replace(/[^a-z0-9]/gi, '').toLowerCase();
		Soil.data(false, false, false, 'form', title, formId);
		test.formTitle = '';

	}
}]);