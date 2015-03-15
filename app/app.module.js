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
.factory('Soil', ["$firebase", function ($firebase){
	return {
		data: function(data, id){
			var ref = new Firebase("https://soil.firebaseio.com/");
			//create a new data entry if new data, else update
			var dataId = null;
			if(id){
				ref.child(id).update({data:data});
			}else{
				var dataId = ref.push({data:data});
			}
			return dataId;
		},
		newData: function(data){
			//create a new data entry
			var ref = new Firebase("https://soil.firebaseio.com/");
			var data = ref.push({data:data});
		}
	};
}])
.controller("AppCtrl", ["Soil", "$scope", "$rootScope", "$firebase", "$routeParams", "$location", "$filter", function(Soil, $scope, $rootScope, $firebase, $routeParams, $location, $filter){
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
	$scope.saveData = function(data){
		Soil.data(data);
		$scope.newData = "";
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
