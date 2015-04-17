'use strict';
var app = angular.module('app', ['firebase', 'ngRoute'])
.run(["$rootScope", "$location", function($rootScope, $location) {
	$rootScope.$on("$routeChangeError", function(event, next, previous, error) {
		if (error === "AUTH_REQUIRED") {
			$location.path("/");
		}
	});
}])
.run(['$rootScope', function($rootScope) {
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		if (current.hasOwnProperty('$$route')) {
			$rootScope.title = current.$$route.title;
		}
	});
}])
.factory("Auth", ["$firebaseAuth", function($firebaseAuth){
	var ref = new Firebase("https://70k.firebaseio.com/");
	return $firebaseAuth(ref);
}])
.config(function($routeProvider){
	$routeProvider.when('/people', {
		templateUrl: 'app/components/people.html',
		controller: 'PeopleCtrl',
		title: 'People',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/events', {
		templateUrl: 'app/components/events.html',
		controller: 'EventsCtrl',
		title: 'Events',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/practicality', {
		templateUrl: 'app/components/practicality.html',
		controller: 'PracticalityCtrl',
		title: 'Practicality'
	}).when('/:form', {
		templateUrl: 'app/components/formRouter.html',
		controller: 'FormCtrl',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/:form/:data', {
		templateUrl: 'app/components/dataRouter.html',
		controller: 'DataCtrl',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/', {
		templateUrl: 'app/components/home.html',
		controller: 'HomeCtrl'
	}).otherwise('/', {
		templateUrl: 'app/components/home.html',
		controller: 'HomeCtrl'
	});
})
.controller("FormCtrl", ["$scope", "$routeParams", "currentAuth", function($scope, $routeParams, currentAuth){
	//Gets the form name from the url and loads the proper html and ctrl
	if(currentAuth){$scope.templateUrl = 'app/components/'+$routeParams.form+'/form.html';}else{console.log("formAuth Failed")}
}])
.controller("DataCtrl", ["$scope", "$routeParams", "$firebaseObject", "currentAuth", "Soil", function($scope, $routeParams, $firebaseObject, currentAuth, Soil){
	var access = $firebaseObject(new Firebase(Soil.url+"/"+$routeParams.form+"/"+$routeParams.data));
	access.$bindTo($scope, "access");
	$scope.setAccess = function(access){
		Soil.access($routeParams.form+"/"+$routeParams.data, access);
	};
	if(currentAuth){$scope.templateUrl = 'app/components/'+$routeParams.form+'/default.html';}else{console.log("dataAuth Failed")}
}])
.factory('Soil', ['$firebaseObject', '$location', '$rootScope', function ($firebaseObject, $location, $rootScope){
	var fburl = 'https://70k.firebaseio.com/forms';
	var ref = new Firebase(fburl);
	var params = $location.path().split("/");
	return {
		url: fburl,
		//returns the path to the current data of the current form determined by the url
		curData: function(){
			var link = params[1]+"/"+params[2];
			var data = $firebaseObject(new Firebase(fburl+"/"+link));
			data.$loaded().then(function(){
				return {"link":link, "data":data.data};
			});
		},
		curList: function(conForm){
			var list = {};
			var cons = $firebaseObject(ref.child(params[1] +"/"+ params[2] +"/connections/"+ conForm));
			cons.$loaded().then(function(){
				angular.forEach(cons, function(value, key) {
					var link = conForm+"/"+key;
					var conData = $firebaseObject(new Firebase(fburl+"/"+link));
					conData.$loaded().then(function(){
		  				list[key] = {"link":link, "data": conData.data};
					});
				});
				return list;
			});
		},
		access: function(link, access){
			if(link){
				ref.child(link+"/public").set(access);
			}else{
				console.log('error running Soil.access(link, access)')
			}
		},
		//returns the path to the current data of the current form determined by the url
		data: function(link){
			var data = $firebaseObject(new Firebase(fburl+"/"+link));
			data.$loaded().then(function(){
				return data.data;
			});
		},
		list: function(conFormLink){
			var list = {};
			var cons = $firebaseObject(new Firebase(fburl+"/"+conFormLink));
			cons.$loaded().then(function(){
				angular.forEach(cons, function(value, key) {
					var link = conForm+"/"+key;
					var conData = $firebaseObject(new Firebase(fburl+"/"+link));
					conData.$loaded().then(function(){
		  				list[key] = {"link":link, "data": conData.data};
					});
				});
				return list;
			});
		},
		//allows the dev to request a list of connections under a paticular form (e.g. a list of messages, a list of dates, a list of todos, etc.)
		cons: function(conForm){
			return fburl +"/"+ params[1] +"/"+ params[2] +"/connections/"+ conForm;
		},
		path: function(){
			console.log(params);
			return {form:params[1], data:params[2], view:params[3], conForm:params[4]};
		},
		put: function(data){
			//If dataId and data.pId are given, then we're just updating 
			//So go in and update parent data and child data
			var cId = data.cId;
			var pId = data.pId;
			var errorCb = function(error){if(error){console.log(error);}}
			if(data.cForm && data.cData && data.cId && data.pForm && data.pData && data.pId){
				ref.child(data.pForm+'/'+data.pId).update({data:data.pData,owner:$rootScope.authData.uid}, errorCb);
				ref.child(data.pForm+'/'+data.pId+'/connections/'+data.cForm+'/'+data.cId).update({link:data.cForm+'/'+data.cId}, errorCb);
				ref.child(data.cForm+'/'+data.cId).update({data:data.cData,owner:$rootScope.authData.uid}, errorCb);
				ref.child(data.cForm+'/'+data.cId+'/connections/'+data.pForm+'/'+data.pId).update({link:data.pForm+'/'+data.pId}, errorCb);
				return {parent:pId,child:cId};
			}else if(data.cForm && data.cData && data.cId && data.pForm && data.pData && !data.pId){
				pId = ref.child(data.pForm).push({data:data.pData,owner:$rootScope.authData.uid}, function(error){
					if(error){console.log(error);}else{
						ref.child(data.pForm+'/'+pId.key()+'/connections/'+data.cForm+'/'+data.cId).update({link:data.cForm+'/'+data.cId}, errorCb);
						ref.child(data.cForm+'/'+data.cId).update({data:data.cData,owner:$rootScope.authData.uid}, errorCb);
						ref.child(data.cForm+'/'+data.cId+'/connections/'+data.pForm+'/'+pId.key()).update({link:data.pForm+'/'+pId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(data.cForm && data.cData && !data.cId && data.pForm && data.pData && data.pId){
				cId = ref.child(data.cForm).push({data:data.cData,owner:$rootScope.authData.uid}, function(error){
					if(error){console.log(error);}else{
						ref.child(data.cForm+'/'+cId.key()+'/connections/'+data.pForm+'/'+data.pId).update({link:data.pForm+'/'+data.pId}, errorCb);
						ref.child(data.pForm+'/'+data.pId).update({data:data.pData,owner:$rootScope.authData.uid}, errorCb);
						ref.child(data.pForm+'/'+data.pId+'/connections/'+data.cForm+'/'+cId.key()).update({link:data.cForm+'/'+cId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(data.cForm && data.cData && !data.cId && data.pForm && data.pData && !data.pId){
				cId = ref.child(data.cForm).push({data:data.cData,owner:$rootScope.authData.uid}, function(cError){
					if(cError){console.log(cError);}else{
						pId = ref.child(data.pForm).push({data:data.pData,owner:$rootScope.authData.uid}, function(pError){
							if(pError){console.log(pError);}else{
								ref.child(data.pForm+'/'+pId.key()+'/connections/'+data.cForm+'/'+cId.key()).update({link:data.cForm+'/'+cId.key()}, errorCb);
								ref.child(data.cForm+'/'+cId.key()+'/connections/'+data.pForm+'/'+pId.key()).update({link:data.pForm+'/'+pId.key()}, errorCb);
								return {parent:pId,child:cId};
							}
						});
					}
				});
			}else if(data.cForm && data.cData && data.cId && !data.pForm && !data.pData && !data.pId){
				ref.child(data.cForm+'/'+data.cId).update({data:data.cData,owner:$rootScope.authData.uid}, errorCb);
				return {parent:pId,child:cId};
			}else if(!data.cForm && !data.cData && !data.cId && data.pForm && data.pData && data.pId){
				ref.child(data.pForm+'/'+data.pId).update({data:data.pData,owner:$rootScope.authData.uid}, errorCb);
				return {parent:pId,child:cId};
			}else if(data.cForm && data.cData && !data.cId && !data.pForm && !data.pData && !data.pId){
				cId = ref.child(data.cForm).push({data:data.cData,owner:$rootScope.authData.uid}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else if(!data.cForm && !data.cData && !data.cId && data.pForm && data.pData && !data.pId){
				pId = ref.child(data.pForm).push({data:data.pData,owner:$rootScope.authData.uid}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else{
				console.log("Failed to meet put criteria: "+data);
			}
		}
	};
}])
.controller("AppCtrl", ["$location", "$rootScope", "Soil", "$firebaseAuth", "Auth", function($location, $rootScope, Soil, $firebaseAuth, Auth){
	$rootScope.practiceForm = $location.path() === '/practice-list';
	var ctrl = this;
	$rootScope.auth = Auth;
    Auth.$onAuth(function(authData) {
    	if(authData){
    		$('#loginModal').modal('hide');
    		console.log(authData);
    		$location.path("/");
			$rootScope.authData = authData;
			var date = Math.round(Date.now() / 1000);
			date.substring;
			var dateID = date.toString();
			if(authData.google){
				Soil.put({cForm:'activity', cData:date, cId:dateID, pForm:'users', pData:authData.google.displayName, pId:authData.uid});
			}else if(authData.twitter){
				Soil.put({cForm:'activity', cData:date, cId:dateID, pForm:'users', pData:authData.twitter.displayName, pId:authData.uid});
			}else if(authData.facebook){
				Soil.put({cForm:'activity', cData:date, cId:dateID, pForm:'users', pData:authData.facebook.displayName, pId:authData.uid});
			}
    	}else{
    		$location.path("/");
    		$rootScope.authData = false;
    	}
    });
}]);
//so when 70k boots up you'll be presented with a very quick description and large photos of what we're about and the three sign in buttons. 
//Then when you sign in the screen wont change but you'll have access to the homepage