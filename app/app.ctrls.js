app.controller("formForm", ['Soil', function(Soil){
	this.saveData = function(formTitle){
		var formId = formTitle.replace(/[^a-z0-9]/gi, '');
		var newIds = Soil.data(false, false, false, 'form', formTitle, formId);
	}
}]);