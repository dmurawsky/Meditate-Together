app.controller("formForm", ['Soil', function(Soil){
	var test = this;
	this.saveData = function(title){
		var formId = title.replace(/[^a-z0-9]/gi, '').toLowerCase();
		var date = Date.now();
		Soil.data('Date', date, false, 'form', title, formId);
		test.formTitle = '';
	}
}]);