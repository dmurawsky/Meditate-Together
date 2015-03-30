app.controller("formForm", ['Soil', '$firebaseObject', '$scope', function(Soil, $firebaseObject, $scope){
	var ref = new Firebase(Soil.url);
	var formCtrl = this;
	this.saveData = function(title){
		var formId = title.replace(/[^a-z0-9]/gi, '').toLowerCase();
		var date = Math.round(Date.now() / 1000);
		var dateID = date.toString();
		var newForm = Soil.put({cForm:'createdtime', cData:date, cId:dateID, pForm:'form', pData:title, pId:formId});
		Soil.access("form/"+formId, true);
		formCtrl.formTitle = '';
	};
	this.deleteForm = function(form){
		if (confirm("Are you sure you want to delete "+form+"?")){
			ref.child(form).remove();
			ref.child("form/"+form).remove();
		}
	};
}])
.controller("formData", ['Soil', function(Soil){
}])
.controller("HomeCtrl", ["Soil", function(Soil){
}]);