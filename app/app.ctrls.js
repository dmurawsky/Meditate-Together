app.controller("formForm", ['Soil', function(Soil){
	var formCtrl = this;
	this.saveData = function(title){
		var formId = title.replace(/[^a-z0-9]/gi, '').toLowerCase();
		var date = Date.now();
		var newForm = Soil.put('createdtime', date, date.toString(), 'form', title, formId);
		formCtrl.formTitle = '';
	};
	var ref = new Firebase(FBURL);
	var obj = $firebaseObject(ref.child('form'));
	// The $loaded() promise signifies that the initial state has been downloaded
	obj.$loaded().then(function() {
		obj.$bindTo(formCtrl, "forms");
		angular.forEach(obj, function(value, key) {
			angular.forEach(value.createdtime, function(timeValue, timeKey){
				ref.child(timeValue.link).once('value', function(snap){
					var val = snap.val();
					obj[key].time = val.data;
				});
			});
		});
		console.log("forms loaded");
	});
}])
.controller("formData", ['Soil', function(Soil){
}])
.controller("HomeCtrl", ["Soil", function(Soil){
}]);