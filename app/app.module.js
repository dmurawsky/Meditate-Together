'use strict';
var app = angular.module('app', ['firebase', 'ngRoute'])
.run(["$rootScope", "$location", function($rootScope, $location) {
	$rootScope.$on("$routeChangeError", function(event, next, previous, error) {
				console.log("test");
				console.log(error);
		// We can catch the error thrown when the $requireAuth promise is rejected
		// and redirect the user back to the home page
		if (error === "AUTH_REQUIRED") {
			$location.path("/");
		}
	});
}])
.factory('Soil', ['$firebaseObject', function ($firebaseObject){
	var fburl = 'https://soil.firebaseio.com/';
	var ref = new Firebase(fburl);
	return {
		url: fburl,
		path: function(){
			var params = $location.path().split("/");
			console.log(params);
			return {form:params[1], data:params[2], view:params[3]};
		},
		access: function(data){
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
				console.log("Failed to meet access criteria.");
			}
			//if (typeof callback === "function") {
    		//	callback();
			//} else {console.log('Failed to run callback');}
		},
		put: function(data){
			//If dataId and data.pId are given, then we're just updating 
			//So go in and update parent data and child data
			var cId = data.cId;
			var pId = data.pId;
			var errorCb = function(error){if(error){console.log(error);}}
			if(data.cForm && data.cData && data.cId && data.pForm && data.pData && data.pId){
				ref.child(data.pForm+'/'+data.pId).update({data:data.pData}, errorCb);
				ref.child(data.pForm+'/'+data.pId+'/'+data.cForm+'/'+data.cId).update({link:data.cForm+'/'+data.cId}, errorCb);
				ref.child(data.cForm+'/'+data.cId).update({data:data.cData}, errorCb);
				ref.child(data.cForm+'/'+data.cId+'/'+data.pForm+'/'+data.pId).update({link:data.pForm+'/'+data.pId}, errorCb);
				return {parent:pId,child:cId};
			}else if(data.cForm && data.cData && data.cId && data.pForm && data.pData && !data.pId){
				pId = ref.child(data.pForm).push({data:data.pData}, function(error){
					if(error){console.log(error);}else{
						ref.child(data.pForm+'/'+pId.key()+'/'+data.cForm+'/'+data.cId).update({link:data.cForm+'/'+data.cId}, errorCb);
						ref.child(data.cForm+'/'+data.cId).update({data:data.cData}, errorCb);
						ref.child(data.cForm+'/'+data.cId+'/'+data.pForm+'/'+pId.key()).update({link:data.pForm+'/'+pId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(data.cForm && data.cData && !data.cId && data.pForm && data.pData && data.pId){
				cId = ref.child(data.cForm).push({data:data.cData}, function(error){
					if(error){console.log(error);}else{
						ref.child(data.cForm+'/'+cId.key()+'/'+data.pForm+'/'+data.pId).update({link:data.pForm+'/'+data.pId}, errorCb);
						ref.child(data.pForm+'/'+data.pId).update({data:data.pData}, errorCb);
						ref.child(data.pForm+'/'+data.pId+'/'+data.cForm+'/'+cId.key()).update({link:data.cForm+'/'+cId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(data.cForm && data.cData && !data.cId && data.pForm && data.pData && !data.pId){
				cId = ref.child(data.cForm).push({data:data.cData}, function(cError){
					if(cError){console.log(cError);}else{
						pId = ref.child(data.pForm).push({data:data.pData}, function(pError){
							if(pError){console.log(pError);}else{
								ref.child(data.pForm+'/'+pId.key()+'/'+data.cForm+'/'+cId.key()).update({link:data.cForm+'/'+cId.key()}, errorCb);
								ref.child(data.cForm+'/'+cId.key()+'/'+data.pForm+'/'+pId.key()).update({link:data.pForm+'/'+pId.key()}, errorCb);
								return {parent:pId,child:cId};
							}
						});
					}
				});
			}else if(data.cForm && data.cData && data.cId && !data.pForm && !data.pData && !data.pId){
				ref.child(data.cForm+'/'+data.cId).update({data:data.cData}, errorCb);
				return {parent:pId,child:cId};
			}else if(!data.cForm && !data.cData && !data.cId && data.pForm && data.pData && data.pId){
				ref.child(data.pForm+'/'+data.pId).update({data:data.pData}, errorCb);
				return {parent:pId,child:cId};
			}else if(data.cForm && data.cData && !data.cId && !data.pForm && !data.pData && !data.pId){
				cId = ref.child(data.cForm).push({data:data.cData}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else if(!data.cForm && !data.cData && !data.cId && data.pForm && data.pData && !data.pId){
				pId = ref.child(data.pForm).push({data:data.pData}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else{
				console.log("Failed to meet put criteria: "+data);
			}
			//if (typeof callback === "function") {
    		//	callback();
			//} else {console.log('Failed to run callback');}
		}
	};
}])
.factory("Auth", ["Soil", "$firebaseAuth", function(Soil, $firebaseAuth){
	var ref = new Firebase(Soil.url);
	return $firebaseAuth(ref);
}])
.config(function($routeProvider) {
	$routeProvider.when('/:form', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'FormCtrl',
		resolve: {
		// controller will not be loaded until $requireAuth resolves
		// Auth refers to our $firebaseAuth wrapper in the example above
			"currentAuth": ["Auth", function(Auth) {
				console.log("test");
			// $requireAuth returns a promise so the resolve waits for it to complete
			// If the promise is rejected, it will throw a $stateChangeError (see above)
				return Auth.$requireAuth();
			}]
		}
	}).when('/:form/:data', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'DataCtrl',
		resolve: {
		// controller will not be loaded until $requireAuth resolves
		// Auth refers to our $firebaseAuth wrapper in the example above
			"currentAuth": ["Auth", function(Auth) {
			// $requireAuth returns a promise so the resolve waits for it to complete
			// If the promise is rejected, it will throw a $stateChangeError (see above)
				return Auth.$requireAuth();
			}]
		}
	}).when('/:form/:data/:view', {
		templateUrl: 'app/components/urlRouter.html',
		controller: 'ViewCtrl',
		resolve: {
		// controller will not be loaded until $requireAuth resolves
		// Auth refers to our $firebaseAuth wrapper in the example above
			"currentAuth": ["Auth", function(Auth) {
			// $requireAuth returns a promise so the resolve waits for it to complete
			// If the promise is rejected, it will throw a $stateChangeError (see above)
				return Auth.$requireAuth();
			}]
		}
	}).when('/', {
		templateUrl: 'app/components/home.html',
		controller: 'HomeCtrl'
	});
})
.controller("FormCtrl", ["$scope", "$routeParams", "currentAuth", function($scope, $routeParams, currentAuth){
	//Gets the form name from the url and loads the proper html and ctrl
	console.log(currentAuth)
	if(currentAuth){$scope.templateUrl = 'app/components/'+$routeParams.form+'/form.html';}else{console.log("formAuth Failed")}
}])
.controller("DataCtrl", ["$scope", "$routeParams", "currentAuth", function($scope, $routeParams, currentAuth){
	//Gets the form name from the url and loads the proper html and ctrl
	if(currentAuth){$scope.templateUrl = 'app/components/'+$routeParams.form+'/data.html';}
}])
.controller("ViewCtrl", ["$scope", "$routeParams", "currentAuth", function($scope, $routeParams, currentAuth){
	//Gets the form name from the url and loads the proper html and ctrl
	if(currentAuth){$scope.templateUrl = 'app/components/'+$routeParams.form+'/'+$routeParams.view+'.html';}
}])
.factory('Soil', ['$firebaseObject', function ($firebaseObject){
	var fburl = 'https://soil.firebaseio.com/';
	var ref = new Firebase(fburl);
	return {
		url: fburl,
		path: function(){
			var params = $location.path().split("/");
			console.log(params);
			return {form:params[1], data:params[2], view:params[3]};
		},
		access: function(data){
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
				console.log("Failed to meet access criteria.");
			}
			//if (typeof callback === "function") {
    		//	callback();
			//} else {console.log('Failed to run callback');}
		},
		put: function(data){
			//If dataId and data.pId are given, then we're just updating 
			//So go in and update parent data and child data
			var cId = data.cId;
			var pId = data.pId;
			var errorCb = function(error){if(error){console.log(error);}}
			if(data.cForm && data.cData && data.cId && data.pForm && data.pData && data.pId){
				ref.child(data.pForm+'/'+data.pId).update({data:data.pData}, errorCb);
				ref.child(data.pForm+'/'+data.pId+'/'+data.cForm+'/'+data.cId).update({link:data.cForm+'/'+data.cId}, errorCb);
				ref.child(data.cForm+'/'+data.cId).update({data:data.cData}, errorCb);
				ref.child(data.cForm+'/'+data.cId+'/'+data.pForm+'/'+data.pId).update({link:data.pForm+'/'+data.pId}, errorCb);
				return {parent:pId,child:cId};
			}else if(data.cForm && data.cData && data.cId && data.pForm && data.pData && !data.pId){
				pId = ref.child(data.pForm).push({data:data.pData}, function(error){
					if(error){console.log(error);}else{
						ref.child(data.pForm+'/'+pId.key()+'/'+data.cForm+'/'+data.cId).update({link:data.cForm+'/'+data.cId}, errorCb);
						ref.child(data.cForm+'/'+data.cId).update({data:data.cData}, errorCb);
						ref.child(data.cForm+'/'+data.cId+'/'+data.pForm+'/'+pId.key()).update({link:data.pForm+'/'+pId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(data.cForm && data.cData && !data.cId && data.pForm && data.pData && data.pId){
				cId = ref.child(data.cForm).push({data:data.cData}, function(error){
					if(error){console.log(error);}else{
						ref.child(data.cForm+'/'+cId.key()+'/'+data.pForm+'/'+data.pId).update({link:data.pForm+'/'+data.pId}, errorCb);
						ref.child(data.pForm+'/'+data.pId).update({data:data.pData}, errorCb);
						ref.child(data.pForm+'/'+data.pId+'/'+data.cForm+'/'+cId.key()).update({link:data.cForm+'/'+cId.key()}, errorCb);
						return {parent:pId,child:cId};
					}
				});
			}else if(data.cForm && data.cData && !data.cId && data.pForm && data.pData && !data.pId){
				cId = ref.child(data.cForm).push({data:data.cData}, function(cError){
					if(cError){console.log(cError);}else{
						pId = ref.child(data.pForm).push({data:data.pData}, function(pError){
							if(pError){console.log(pError);}else{
								ref.child(data.pForm+'/'+pId.key()+'/'+data.cForm+'/'+cId.key()).update({link:data.cForm+'/'+cId.key()}, errorCb);
								ref.child(data.cForm+'/'+cId.key()+'/'+data.pForm+'/'+pId.key()).update({link:data.pForm+'/'+pId.key()}, errorCb);
								return {parent:pId,child:cId};
							}
						});
					}
				});
			}else if(data.cForm && data.cData && data.cId && !data.pForm && !data.pData && !data.pId){
				ref.child(data.cForm+'/'+data.cId).update({data:data.cData}, errorCb);
				return {parent:pId,child:cId};
			}else if(!data.cForm && !data.cData && !data.cId && data.pForm && data.pData && data.pId){
				ref.child(data.pForm+'/'+data.pId).update({data:data.pData}, errorCb);
				return {parent:pId,child:cId};
			}else if(data.cForm && data.cData && !data.cId && !data.pForm && !data.pData && !data.pId){
				cId = ref.child(data.cForm).push({data:data.cData}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else if(!data.cForm && !data.cData && !data.cId && data.pForm && data.pData && !data.pId){
				pId = ref.child(data.pForm).push({data:data.pData}, function(error){
					if(error){console.log(error);}else{return {parent:pId,child:cId};}
				});
			}else{
				console.log("Failed to meet put criteria: "+data);
			}
			//if (typeof callback === "function") {
    		//	callback();
			//} else {console.log('Failed to run callback');}
		}
	};
}])
.controller("AppCtrl", ["$rootScope", "Soil", "$firebaseAuth", "Auth", function($rootScope, Soil, $firebaseAuth, Auth){
	var ctrl = this;
	$rootScope.auth = Auth;
    Auth.$onAuth(function(authData) {
    	if(authData){
			$rootScope.authData = authData;
			var date = Math.round(Date.now() / 1000);
			date.substring;
			var dateID = date.toString();
			Soil.put({cForm:'activity', cData:date, cId:dateID, pForm:'users', pData:authData.google.displayName, pId:authData.google.id});
    	}
    });
}]);