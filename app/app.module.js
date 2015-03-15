'use strict';
var app = angular.module('app', ['firebase', 'ngRoute'])
.config(function($routeProvider) {
	$routeProvider.when('/:monad', {
		templateUrl: 'app/components/monad.html',
		controller: 'MonadCtrl'
	}).when('/', {
		templateUrl: 'app/components/search.html',
		controller: 'SearchCtrl'
	});
})
.factory('Connection', ["$filter", "$firebase", function ($filter, $firebase){
	return {
		create: function(monad, newCon, newRel){
			//create a connection by adding a connection and relationship and setting the value to true
			var ref = new Firebase("https://soil.firebaseio.com/connections/");
			var sanConnection = $filter('sanInput')(newCon);
			var sanRelationship = $filter('sanInput')(newRel);
			var connection = ref.push({mon:monad,con:newCon,rel:newRel});
			var monRef = new Firebase("https://soil.firebaseio.com/monads/");
			monRef.child(monad+"/"+connection.key()).set({access:"public"});
			monRef.child(sanConnection+"/"+connection.key()).set({access:"public"});
			monRef.child(sanRelationship+"/"+connection.key()).set({access:"public"});
		}
	};
}])
.factory('Data', ["$filter", "$firebase", function ($filter, $firebase){
	return {
		addNew: function(newDataType, newDataTitle, newData){
			//create a connection by adding a connection and relationship and setting the value to true
			var ref = new Firebase("https://soil.firebaseio.com/connections/");
			
		}
	};
}])
.controller("AppCtrl", ["Data", "Connection", "$scope", "$rootScope", "$firebase", "$routeParams", "$location", "$filter", function(Data, Connection, $scope, $rootScope, $firebase, $routeParams, $location, $filter){
	//angularFire sync object
	var ref = new Firebase("https://soil.firebaseio.com/monads/"+$routeParams.monad);
	var sync = $firebase(ref).$asObject();
	sync.$loaded(function(data) {
		sync["test"] = "testy";
		sync.$bindTo($scope, "monad");
	});
	//if this is the first time visiting this link add the title property to create the monad model
	ref.once("value", function(snap){
		var title = snap.hasChild('title');
		if(!title){
			var sanTitle = $filter('sanInput')($routeParams.monad);
			ref.child("title").set(sanTitle);
		}
	});
	$scope.makeConnection = function(newConnection, newRelationship){
		Connection.create($routeParams.monad, newConnection, newRelationship);
		$scope.newConnection = "";
		$scope.newRelationship = "";
	}
	$scope.saveData = function(newDataType, newData){
		Data.addNew($routeParams.monad, newConnection, newRelationship);
		$scope.newConnection = "";
		$scope.newRelationship = "";
	}
}])
.controller("MonadCtrl", ["Connection", "$scope", "$rootScope", "$firebase", "$routeParams", "$location", "$filter", function(Connection, $scope, $rootScope, $firebase, $routeParams, $location, $filter){
	//angularFire sync object
	var monadRef = new Firebase("https://soil.firebaseio.com/monads/"+$routeParams.monad);
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
	$scope.makeConnection = function(newConnection, newRelationship){
		Connection.create($routeParams.monad, newConnection, newRelationship);
		$scope.newConnection = "";
		$scope.newRelationship = "";
	}
}])
.controller("SearchCtrl", ["$scope", "$rootScope", "$firebase", function($scope, $rootScope, $firebase){

}])
//filter for sanitizing strings for links
.filter("sanInput", function() {
	return function(input) {
		input = input.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
		return input.trim();
	};
});;
