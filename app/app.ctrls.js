app.controller("form", ["$scope", "$routeParams", function($scope, $routeParams){
	$scope.rps = $routeParams;
	this.test = "test";
}])