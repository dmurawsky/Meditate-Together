app.controller("formForm", ['Soil', '$firebaseObject', '$scope', function(Soil, $firebaseObject, $scope){
	var ref = new Firebase(Soil.url);
	var formCtrl = this;
	this.saveData = function(title){
		var formId = title.replace(/[^a-z0-9]/gi, '').toLowerCase();
		var date = Date.now();
		var dateID = date.toString();
		var newForm = Soil.put('createdtime', date, dateID, 'form', title, formId);
		formCtrl.formTitle = '';
	};
	this.deleteForm = function(form){
		if (confirm("Are you sure you want to delete "+form+"?")){
			ref.child(form).remove();
		}
	};
	var obj = $firebaseObject(ref.child('form'));
	// The $loaded() promise signifies that the initial state has been downloaded
	obj.$loaded().then(function() {
		angular.forEach(obj, function(value, key) {
			console.log(key+" - "+value);
			angular.forEach(value.createdtime, function(timeValue, timeKey){
				console.log(timeKey +" - "+ timeValue);
				obj[key].time = Number(timeKey);
			});
		});
		console.log("forms loaded");
	});
	obj.$bindTo($scope, "forms");
}])
.controller("formData", ['Soil', function(Soil){
}])
.controller("HomeCtrl", ["Soil", function(Soil){
}]);