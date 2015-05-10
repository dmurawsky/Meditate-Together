app.controller("HamsasCtrl", ['HYS', function(HYS){
}])
.controller("HamsaCtrl", ['HYS', function(HYS){
}])
.controller("MeditationsCtrl", ['HYS', '$scope', function(HYS, $scope){
	var ref = new Firebase(HYS.url+"/meditations");
	$scope.meditations = $firebaseObject(ref);
}])
.controller("GroupsCtrl", ['HYS', function(HYS){
}])
.controller("GroupCtrl", ['HYS', function(HYS){
}])
.controller("HomeCtrl", ["HYS", function(HYS){
}]);