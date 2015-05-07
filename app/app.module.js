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
	$routeProvider.when('/', {
		templateUrl: 'app/components/home.html',
		controller: 'HomeCtrl'
	}).when('/hamsas', {
		templateUrl: 'app/components/hamsas.html',
		controller: 'HamsasCtrl',
		title: 'Hamsas',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/hamsa/:userid', {
		templateUrl: 'app/components/hamsa.html',
		controller: 'HamsaCtrl',
		title: 'Hamsas',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/meditations', {
		templateUrl: 'app/components/meditations.html',
		controller: 'MeditationsCtrl',
		title: 'Meditations',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/groups', {
		templateUrl: 'app/components/groups.html',
		controller: 'GroupsCtrl',
		title: 'Groups',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).when('/group/:group', {
		templateUrl: 'app/components/group.html',
		controller: 'GroupCtrl',
		title: 'Group',
		resolve: {"currentAuth": ["Auth", function(Auth) {return Auth.$requireAuth();}]}
	}).otherwise('/', {
		templateUrl: 'app/components/home.html',
		controller: 'HomeCtrl'
	});
}).controller("AppCtrl", ["$location", "$rootScope", "HYS", "$firebaseAuth", "Auth", function($location, $rootScope, HYS, $firebaseAuth, Auth){
	var ctrl = this;
	$rootScope.auth = Auth;
	console.log(HYS.url);
	var ref = new Firebase(HYS.url);
	this.setMed = function(){
		var time = Date.now();
		ref.child("users/"+authData.uid+"/meditation/").set({"comment":ctrl.comment,"duration":ctrl.duration,"time":time});
		ref.child("meditations").push({"comment":ctrl.comment,"duration":ctrl.duration,"user":authData.uid,"time":time});
	};
    Auth.$onAuth(function(authData) {
    	if(authData){
    		console.log(authData);
    		$location.path("/");
			$rootScope.authData = authData;
			switch(authData.provider) {
				case "google":
					ref.child("users/"+authData.uid).set({"name":authData.google.displayName,"link":authData.google.cachedUserProfile.link});
					break;
				case "facebook":
					ref.child("users/"+authData.uid).set({"name":authData.facebook.displayName,"link":authData.facebook.cachedUserProfile.link});
					break;
				case "twitter":
					ref.child("users/"+authData.uid).set({"name":authData.twitter.displayName,"link":"https://twitter.com/"+authData.twitter.username});
					break;
			}
    	}else{
    		$location.path("/");
    		$rootScope.authData = false;
    	}
    });
}])
.factory("HYS", ['$firebaseObject', '$location', '$rootScope', function ($firebaseObject, $location, $rootScope){
	var fburl = 'https://tds.firebaseio.com/';
	var ref = new Firebase(fburl);
	return {
		url: fburl
	}
}]);