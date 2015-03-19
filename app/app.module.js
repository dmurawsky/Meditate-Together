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
	$scope.templateUrl = 'app/components/'+$routeParams.form+'/'+$routeParams.view+'.html';
}])
.factory('Soil', ["$firebase", function ($firebase){
	var ref = new Firebase("https://soil.firebaseio.com/");
	return {
		params: function(){
			var params = $location.path().split("/");
			console.log(params);
			return {form:params[1], data:params[2], view:params[3]};
		},
		data: function(childForm, childData, childId, parentForm, parentData, parentId, callback){
			//If dataId and parentId are given, then we're just updating 
			//So go in and update parent data and child data
			var cId = childId;
			var pId = parentId;
			var errorCb = function(error){if(error){console.log(error);}}
			if(childForm && childData && childId && parentForm && parentData && parentId){
				ref.child(parentForm+'/'+parentId).update({data:parentData});
				ref.child(parentForm+'/'+parentId+'/'+childForm+'/'+childId).update({link:childForm+'/'+childId});
				ref.child(childForm+'/'+childId).update({data:childData,});
				ref.child(childForm+'/'+childId+'/'+parentForm+'/'+parentId).update({link:parentForm+'/'+parentId});
			}else if(childForm && childData && childId && parentForm && parentData && !parentId){
				pId = ref.child(parentForm).push({data:parentData}, function(error){
					if(error){console.log(error);}else{
						ref.child(parentForm+'/'+pId.key()+'/'+childForm+'/'+childId).update({link:childForm+'/'+childId}, errorCb);
						ref.child(childForm+'/'+childId).update({data:childData}, errorCb);
						ref.child(childForm+'/'+childId+'/'+parentForm+'/'+pId.key()).update({link:parentForm+'/'+pId.key()}, errorCb);
					}
				});
			}else if(childForm && childData && !childId && parentForm && parentData && !parentId){
				cId = ref.child(childForm).push({data:childData}, function(cError){
					if(cError){console.log(cError);}else{
						pId = ref.child(parentForm).push({data:parentData}, function(pError){
							if(pError){console.log(pError);}else{
								ref.child(parentForm+'/'+pId.key()+'/'+childForm+'/'+cId.key()).update({link:childForm+'/'+cId.key()}, errorCb);
								ref.child(childForm+'/'+cId.key()+'/'+parentForm+'/'+pId.key()).update({link:parentForm+'/'+pId.key()}, errorCb);
							}
						});
					}
				});
			}else if(childForm && childData && childId && !parentForm && !parentData && !parentId){
				ref.child(childForm+'/'+childId).update({data:childData}, errorCb);
			}else if(!childForm && !childData && !childId && parentForm && parentData && parentId){
				ref.child(parentForm+'/'+parentId).update({data:parentData}, errorCb);
			}else if(childForm && childData && !childId && !parentForm && !parentData && !parentId){
				cId = ref.child(childForm).push({data:childData}, errorCb);
			}else if(!childForm && !childData && !childId && parentForm && parentData && !parentId){
				pId = ref.child(parentForm).push({data:parentData}, errorCb);
			}
			if (typeof callback === "function") {
    			callback();
			} else {console.log('Failed to run callback');}
			return {parent:pId,child:cId};
		},
		ref: function(){
			return ref;
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
