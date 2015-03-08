var app = angular.module('app', ['firebase', 'ngRoute'])
.config(function($routeProvider) {
	$routeProvider.when('/:monad', {
		templateUrl: 'app/components/monad.html',
		controller: 'monadCtrl'
	}).when('/:monad/:view', {
		templateUrl: 'app/components/view.html',
		controller: 'viewCtrl'
	}).when('/', {
		templateUrl: 'app/components/search.html',
		controller: 'searchCtrl'
	});
})
.controller("monadCtrl", ["$scope", "$rootScope", "$firebase", "$routeParams", "$location", "$filter", function($scope, $rootScope, $firebase, $routeParams, $location, $filter){
	//angularFire sync object
	var ref = new Firebase("https://soil.firebaseio.com/"+$routeParams.monad);
	var sync = $firebase(ref).$asObject();
	sync.$bindTo($scope, "monad");
	//if this is the first time visiting this link add the title property to create the monad model
	ref.once("value", function(snap){
		var title = snap.hasChild('title');
		if(!title){
			var sanTitle = $filter('sanInput')($routeParams.monad);
			ref.child("title").set(sanTitle);
		}
	});
	//create a connection by adding a connection and relationship and setting the value to true
	$scope.makeConnection = function(newConnection, newRelationship){
		var sanConnection = $filter('sanInput')(newConnection);
		var sanRelationship = $filter('sanInput')(newRelationship);
		ref.child("/connections/"+sanRelationship+"/"+sanConnection).set(true);
		$scope.newConnection = "";
		$scope.newRelationship = "";
	}
}])
.controller("viewCtrl", ["$scope", "$rootScope", "$firebase", "$routeParams", "$location", "$filter", function($scope, $rootScope, $firebase, $routeParams, $location, $filter){
	//angularFire sync object
	var monadRef = new Firebase("https://soil.firebaseio.com/"+$routeParams.monad);
	var monadSync = $firebase(monadRef).$asObject();
	monadSync.$bindTo($scope, "monad");
	//if this is the first time visiting this link add the title property to create the monad model
	monadRef.once("value", function(snap){
		var title = snap.hasChild('title');
		if(!title){
			var sanTitle = $filter('sanInput')($routeParams.monad);
			ref.child("title").set(sanTitle);
		}
	});
	//create a connection by adding a connection and relationship and setting the value to true
	$scope.makeConnection = function(newConnection, newRelationship){
		var sanConnection = $filter('sanInput')(newConnection);
		var sanRelationship = $filter('sanInput')(newRelationship);
		ref.child("/connections/"+sanRelationship+"/"+sanConnection).set(true);
		$scope.newConnection = "";
		$scope.newRelationship = "";
	}
}])
.controller("searchCtrl", ["$scope", "$rootScope", "$firebase", function($scope, $rootScope, $firebase){

}])
//filter for sanitizing strings for links
.filter("sanInput", function() {
	return function(input) {
		input = input.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
		return input.trim();
	};
});;
