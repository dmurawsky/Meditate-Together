app.controller("formForm", ['Soil', function(Soil){
	var ctrl = this;
	this.saveData = function(formTitle){
		var formId = formTitle.replace(/[^a-z0-9]/gi, '');
		var newIds = Soil.data('a', 'a', 'a', 'form', 'formTitle', 'a');
		ctrl.formTitle = '';
	}
}]);