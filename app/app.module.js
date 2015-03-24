'use strict';
var app = angular.module('app', ['firebase', 'ngRoute'])
.config(function($routeProvider) {
	$routeProvider.when('/:form', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'FormCtrl',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/:form/:data', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'DataCtrl',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/:form/:data/:view', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'ViewCtrl',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/', {
		templateUrl: 'app/components/home.html',
		controller: 'HomeCtrl'
	});
})
.run(["$rootScope", "$location", function($rootScope, $location) {
	$rootScope.$on("$routeChangeError", function(event, next, previous, error) {
		if (error === "AUTH_REQUIRED") {
			$location.path("/");
		}
	});
}])
.controller("FormCtrl", ["$scope", "$routeParams", "currentAuth", function($scope, $routeParams, currentAuth){
	//Gets the form name from the url and loads the proper html and ctrl
	$scope.templateUrl = 'app/components/'+$routeParams.form+'/form.html';
}])
.controller("DataCtrl", ["$scope", "$routeParams", "currentAuth", function($scope, $routeParams, currentAuth){
	//Gets the form name from the url and loads the proper html and ctrl
	$scope.templateUrl = 'app/components/'+$routeParams.form+'/data.html';
}])
.controller("ViewCtrl", ["$scope", "$routeParams", "currentAuth", function($scope, $routeParams, currentAuth){
	//Gets the form name from the url and loads the proper html and ctrl
	$scope.templateUrl = 'app/components/'+$routeParams.form+'/'+$routeParams.view+'.html';
}])
.factory('Soil', ['$firebaseObject', function ($firebaseObject){
	var ref = new Firebase('https://soil.firebaseio.com/');
	return {
		url: 'https://soil.firebaseio.com/',
		path: function(){
			var params = $location.path().split("/");
			console.log(params);
			return {form:params[1], data:params[2], view:params[3]};
		},
		put: function(childForm, childData, childId, parentForm, parentData, parentId){
			//If dataId and parentId are given, then we're just updating 
			//So go in and update parent data and child data
			var cId = childId;
			var pId = parentId;
			var errorCb = function(error){if(error){console.log(error);}}
			if(childForm && childData && childId && parentForm && parentData && parentId){
				ref.child(parentForm+'/'+parentId).update({data:parentData}, errorCb);
				ref.child(parentForm+'/'+parentId+'/'+childForm+'/'+childId).update({link:childForm+'/'+childId}, errorCb);
				ref.child(childForm+'/'+childId).update({data:childData}, errorCb);
				ref.child(childForm+'/'+childId+'/'+parentForm+'/'+parentId).update({link:parentForm+'/'+parentId}, errorCb);
				return {parent:pId,child:cId};
			}else if(childForm && childData && childId && parentForm && parentData && !parentId){
				pId = ref.child(parentForm).push({data:parentData}, function(error){
					if(error){console.log(error);}else{
						ref.child(parentForm+'/'+pId.key()+'/'+childForm+'/'+childId).update({link:childForm+'/'+childId}, errorCb);
						ref.child(childForm+'/'+childId).update({data:childData}, errorCb);
						ref.child(childForm+'/'+childId+'/'+parentForm+'/'+pId.key()).update({link:parentForm+'/'+pId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(childForm && childData && !childId && parentForm && parentData && parentId){
				cId = ref.child(childForm).push({data:childData}, function(error){
					if(error){console.log(error);}else{
						ref.child(childForm+'/'+cId.key()+'/'+parentForm+'/'+parentId).update({link:parentForm+'/'+parentId}, errorCb);
						ref.child(parentForm+'/'+parentId).update({data:parentData}, errorCb);
						ref.child(parentForm+'/'+parentId+'/'+childForm+'/'+cId.key()).update({link:childForm+'/'+cId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(childForm && childData && !childId && parentForm && parentData && !parentId){
				cId = ref.child(childForm).push({data:childData}, function(cError){
					if(cError){console.log(cError);}else{
						pId = ref.child(parentForm).push({data:parentData}, function(pError){
							if(pError){console.log(pError);}else{
								ref.child(parentForm+'/'+pId.key()+'/'+childForm+'/'+cId.key()).update({link:childForm+'/'+cId.key()}, errorCb);
								ref.child(childForm+'/'+cId.key()+'/'+parentForm+'/'+pId.key()).update({link:parentForm+'/'+pId.key()}, errorCb);
								return {parent:pId,child:cId};
							}
						});
					}
				});
			}else if(childForm && childData && childId && !parentForm && !parentData && !parentId){
				ref.child(childForm+'/'+childId).update({data:childData}, errorCb);
				return {parent:pId,child:cId};
			}else if(!childForm && !childData && !childId && parentForm && parentData && parentId){
				ref.child(parentForm+'/'+parentId).update({data:parentData}, errorCb);
				return {parent:pId,child:cId};
			}else if(childForm && childData && !childId && !parentForm && !parentData && !parentId){
				cId = ref.child(childForm).push({data:childData}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else if(!childForm && !childData && !childId && parentForm && parentData && !parentId){
				pId = ref.child(parentForm).push({data:parentData}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else{
				console.log("Failed to meet put criteria.");
			}
			//if (typeof callback === "function") {
    		//	callback();
			//} else {console.log('Failed to run callback');}
		},
		get: function(obj){ // this get function is for getting the data out of particular set of connections (determined by a form) underneath a form/id.
			var newObj = {};
			angular.forEach(obj, function(value, key){
				var dataObj = $firebaseObject(ref.child(value.link));
				newObj.$loaded().then(function(){
					newObj[key] = dataObj; //this will not only get the data for this datapoint but also the connections! This is this system can repeat infinitely to make all kinds of connections.
				});
			});
		}
	};
}])
.controller("AppCtrl", ["Soil", "$firebaseAuth", function(Soil, $firebaseAuth){
	var ctrl = this;
	var ref = new Firebase(Soil.url);
    this.auth = $firebaseAuth(ref.child('users'));
    this.auth.$onAuth(function(authData) {
    	if(authData){
			ctrl.authData = authData;
			console.log(authData);
			var date = Date.now();
			var dateID = date.toString();
			Soil.put('lastactive', date, dateID, 'users', authData.google.displayName, authData.google.id);
    	}
    });
}]);