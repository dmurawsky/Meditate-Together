angular.module("chatStorm", ['firebase', 'ngRoute'])
.config(function($routeProvider){
	$routeProvider.when('/:monad', {
		templateUrl: 'app/components/chatStorm.html',
		controller: 'chatCtrl'
	}).when('/', {
		templateUrl: 'app/components/search.html',
		controller: 'searchCtrl'
	});
})
.controller("chatCtrl", ["$scope", "$rootScope", "$firebase", "$routeParams", "$location", function($scope, $rootScope, $firebase, $routeParams, $location){
	var ref = new Firebase("https://soil.firebaseio.com/"+$routeParams.monad);
	var sync = $firebase(ref).$asObject();
	sync.$bindTo($scope, "monad");
}]);
angular.bootstrap('#chatStorm', ['chatStorm']);
angular.module("forganize", ['firebase', 'ngRoute'])
.config(function($routeProvider){
	$routeProvider.when('/:monad', {
		templateUrl: 'app/components/forganize.html',
		controller: 'chatCtrl'
	}).when('/', {
		templateUrl: 'app/components/search.html',
		controller: 'searchCtrl'
	});
})
.controller("chatCtrl", ["$scope", "$rootScope", "$firebase", "$routeParams", "$location", function($scope, $rootScope, $firebase, $routeParams, $location){
	var ref = new Firebase("https://soil.firebaseio.com/"+$routeParams.monad);
	var sync = $firebase(ref).$asObject();
	sync.$bindTo($scope, "monad");
}]);
angular.bootstrap('#forganize', ['forganize']);
angular.module("publish", ['firebase', 'ngRoute'])
.config(function($routeProvider){
	$routeProvider.when('/:monad', {
		templateUrl: 'app/components/publish.html',
		controller: 'chatCtrl'
	}).when('/', {
		templateUrl: 'app/components/search.html',
		controller: 'searchCtrl'
	});
})
.controller("chatCtrl", ["$scope", "$rootScope", "$firebase", "$routeParams", "$location", function($scope, $rootScope, $firebase, $routeParams, $location){
	var ref = new Firebase("https://soil.firebaseio.com/"+$routeParams.monad);
	var sync = $firebase(ref).$asObject();
	sync.$bindTo($scope, "monad");
}]);
angular.bootstrap('#publish', ['publish']);