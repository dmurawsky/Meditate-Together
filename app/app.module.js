var app = angular.module('app', ['firebase', 'ngRoute'])
.config(function($routeProvider) {
	$routeProvider.when('/:monad', {
		templateUrl: 'app/components/monad.html',
		controller: 'monadCtrl'
	}).when('/', {
		templateUrl: 'app/components/search.html',
		controller: 'searchCtrl'
	});
})
.controller("monadCtrl", ["$scope", "$rootScope", "$firebase", "$routeParams", "$location", function($scope, $rootScope, $firebase, $routeParams, $location){
	var ref = new Firebase("https://soil.firebaseio.com/"+$routeParams.monad);
	var sync = $firebase(ref).$asObject();
	sync.$bindTo($scope, "monad");
	ref.once("value", function(snap){
		var title = snap.hasChild('title');
		if(!title){
			ref.child("title").set($routeParams.monad);
		}
	});
	$scope.makeConnection = function(newConnection, newRelationship){
		ref.child("/connections/"+newRelationship+"/"+newConnection).set(true);
		$scope.newConnection = "";
		$scope.newRelationship = "";
	}
}])
.controller("searchCtrl", ["$scope", "$rootScope", "$firebase", function($scope, $rootScope, $firebase){

}])
.filter("sanInput", function() {
	return function(input) {
		input = input.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
		return input.trim();
	};
});;