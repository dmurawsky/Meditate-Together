var app = angular.module('app', ['firebase', 'ngRoute'])
	.config(function($routeProvider, $locationProvider) {
		$routeProvider.when('/:monad', {
			templateUrl: 'app/components/monad.html',
			controller: 'monadCtrl'
		}).when('/', {
			templateUrl: 'app/components/search.html',
			controller: 'searchCtrl'
		});
	})
	.controller("appCtrl", ["$scope", "$rootScope", function($scope, $rootScope){
		//general app stuffs
	}])
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
			var conRef = new Firebase("https://soil.firebaseio.com/"+newConnection);
			var relRef = new Firebase("https://soil.firebaseio.com/"+newRelationship);
			ref.child("/connections/"+newConnection+"/"+newRelationship).set(true);
			ref.child("/connections/"+newRelationship+"/"+newConnection).set(true);
			conRef.child("/connections/"+$routeParams.monad+"/"+newRelationship).set(true);
			conRef.child("/connections/"+newRelationship+"/"+$routeParams.monad).set(true);
			relRef.child("/connections/"+newConnection+"/"+$routeParams.monad).set(true);
			relRef.child("/connections/"+$routeParams.monad+"/"+newConnection).set(true);
		}
	}])
	.controller("searchCtrl", ["$scope", "$rootScope", "$firebase", function($scope, $rootScope, $firebase){
		
	}]);