app.controller("HamsasCtrl", ['HYS', function(HYS){
}])
.controller("HamsaCtrl", ['HYS', function(HYS){
}])
.controller("MeditationsCtrl", ['HYS', '$scope', '$firebaseObject', function(HYS, $scope, $firebaseObject){
	//need to run a loaded function that adds the relevant profile data (name, photo, ulr) to the meditation object.
	var ref = new Firebase(HYS.url);
	var obj = $firebaseObject(ref.child("meditations"));
	obj.$loaded().then(function() {
		console.log("loaded record:", obj.$id, obj.someOtherKeyInData);
		$scope.meditations = obj;
		angular.forEach(obj, function(value, key) {

			console.log(key, value);
		});
	});
}])
.controller("GroupsCtrl", ['HYS', function(HYS){
}])
.controller("GroupCtrl", ['HYS', function(HYS){
}])
.controller("HomeCtrl", ["HYS", function(HYS){
}]);