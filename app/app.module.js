'use strict';
var app = angular.module('app', ['firebase', 'ngRoute'])
.config(function($routeProvider) {
	$routeProvider.when('/:form', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'FormCtrl'
	}).when('/:form/:data', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'DataCtrl'
	}).when('/:form/:data/:view', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'ViewCtrl'
	}).when('/', {
		templateUrl: 'app/components/home.html',
		controller: 'HomeCtrl'
	});
})
.controller("FormCtrl", ["$scope", "$routeParams", function($scope, $routeParams){
	//Gets the form name from the url and loads the proper html and ctrl
	$scope.templateUrl = 'app/components/'+$routeParams.form+'/form.html';
}])
.controller("DataCtrl", ["$scope", "$routeParams", function($scope, $routeParams){
	//Gets the form name from the url and loads the proper html and ctrl
	$scope.templateUrl = 'app/components/'+$routeParams.form+'/data.html';
}])
.controller("ViewCtrl", ["$scope", "$routeParams", function($scope, $routeParams){
	//Gets the form name from the url and loads the proper html and ctrl
	$scope.templateUrl = 'app/components/'+$routeParams.form+'/view.html';
}])
.factory('Soil', ["$firebase", function ($firebase){
	var ref = new Firebase("https://soil.firebaseio.com/");
	return {
		data: function(data, id){
			//create a new data entry if new data, else update
			var dataId = null;
			if(id){
				ref.child(id).update({data:data});
			}else{
				var dataId = ref.push({data:data});
			}
			return dataId;
		},
		ref: function(){
			return ref;
		}
	};
}])
.factory('RouteParams', ["$location", function ($location){
	var params = $location.path().split("/");
	return {form:params[1], data:params[2], view:params[3]};
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
.controller("HomeCtrl", ["Soil", "$scope", "$rootScope", "$firebase", function(Soil, $scope, $rootScope, $firebase){
	var sync = $firebase(Soil.ref()).$asObject();
	sync.$loaded(function() {
		sync.$bindTo($scope, "data");
	});
}])
//filter for sanitizing strings for links
.filter("sanInput", function() {
	return function(input) {
		input = input.replace(/[^a-z0-9]/gi, '-');
		return input.trim();
	};
});
