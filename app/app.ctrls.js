app.controller("HamsasCtrl", ['HYS', function(HYS){
}])
.controller("HamsaCtrl", ['HYS', function(HYS){
}])
.controller("MeditationsCtrl", ['HYS', '$scope', '$firebaseObject', function(HYS, $scope, $firebaseObject){
	//need to run a loaded function that adds the relevant profile data (name, photo, ulr) to the meditation object.
	var ref = new Firebase(HYS.url);
	var obj = $firebaseObject(ref.child("meditations"));
	obj.$loaded().then(function() {
		$scope.meditations = obj;
	});
}])
.controller("GroupsCtrl", ['HYS', function(HYS){
}])
.controller("GroupCtrl", ['HYS', function(HYS){
}])
.controller("HomeCtrl", ["HYS", function(HYS){
}]);