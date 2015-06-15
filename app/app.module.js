'use strict';
var app = angular.module('app', ['firebase', 'angularModalService', 'nsPopover', 'angular-svg-round-progress'])
.factory("Auth", ["$firebaseAuth", "fb", function($firebaseAuth, fb){
	return $firebaseAuth(fb.ref());
}])
.factory('fb', [function fireFactory() {
    return {ref: function(path) {
        var baseUrl = 'https://tds.firebaseio.com';
        path = (path !== '') ?  baseUrl + '/' + path : baseUrl;
        return new Firebase(path);
	}};
}])
.directive('isoRepeat', ['$timeout','$location', function($timeout,$location) {
	var absUrl = $location.absUrl().split("#");
    return {
        scope: {items: '=isoRepeat'},
        templateUrl:absUrl[0]+'template/medIsotope.html',
        link: function (scope, element, attrs) {
            var options = {
                animationEngine : 'jquery',
                itemSelector: '.grid-item',
                layoutMode: 'fitRows',
                sortAscending: true
            };
            element.isotope(options);
            scope.$watch('items', function(newVal, oldVal){
               $timeout(function(){
                    element.isotope( 'reloadItems' ).isotope({ sortBy: 'original-order' }); 
               });
			},true);
            scope.filtertope = function(filter){
				$('.grid').isotope({filter: '.'+filter});
            }
            scope.sortope = function(type){
				$('.grid').isotope({sortBy: type});
            }
        }
    };
}])
.controller('ModalCtrl',function(){})
.controller("AppCtrl", ["$rootScope", '$scope', "fb", "Main", "ModalService", "$firebaseAuth", "Auth", '$interval', '$firebaseArray', '$firebaseObject', 'roundProgressService', 
function($rootScope, $scope, fb, Main, ModalService, $firebaseAuth, Auth, $interval, $firebaseArray, $firebaseObject, roundProgressService){
	var ctrl = this;
	this.showModal = function() {
        ModalService.showModal({
            templateUrl: 'modal.html',
            controller:'ModalCtrl'
        }).then(function(modal){
            modal.element.modal();
            modal.close.then(function(result) {
				console.log(result);
            });
        });
    };
	this.newPreset = function(){
		var authData = $rootScope.authData;
		fb.ref("users/"+authData.uid+"/presets/").push({"hr":"0", "min":"01"});	
	};
	this.removePreset = function(key){
		var authData = $rootScope.authData;
		fb.ref("users/"+authData.uid+"/presets/"+key).remove();	
	};
	this.stopMed = function(key){
		var authData = $rootScope.authData;
		var now=Date.now();
		fb.ref("meditating/"+key).remove();
		fb.ref("meditations/"+key).update({"ends":now});
		fb.ref("users/"+authData.uid+"/meditation/ends").update({"ends":now});	
		$rootScope.medding = false;
	};
	this.setMed = function(hr,min){
		var authData = $rootScope.authData;
		var time = Date.now();
		var duration = (hr*3600000)+(min*60000);
		var ends = Number(time) + duration;
		if(min<10)min="0"+min;
		$rootScope.user.meditation={"duration":duration,"time":time,"ends":ends,"hr":hr,"min":min,"time":time};
		$rootScope.medding = true;
		if(authData.google.cachedUserProfile.link){
			var newMedRef = fb.ref("meditating").push({"duration":duration,"user":authData.uid,"time":time,"ends":ends,"name":authData.google.displayName,"link":authData.google.cachedUserProfile.link,"photo":authData.google.cachedUserProfile.picture},function(error){
				if(!error){
					var key = newMedRef.key();
					fb.ref("meditations/"+key).set({"duration":duration,"user":authData.uid,"time":time,"ends":ends,"name":authData.google.displayName,"link":authData.google.cachedUserProfile.link,"photo":authData.google.cachedUserProfile.picture});	
					$rootScope.user.meditation.key = key;
					Main.updateMed(newMedRef);
				}
			});
		}else{
			var newMedRef = fb.ref("meditating").push({"duration":duration,"user":authData.uid,"time":time,"ends":ends,"name":authData.google.displayName,"photo":authData.google.cachedUserProfile.picture},function(error){
				if(!error){
					var key = newMedRef.key();
					fb.ref("meditations/"+key).set({"duration":duration,"user":authData.uid,"time":time,"ends":ends,"name":authData.google.displayName,"photo":authData.google.cachedUserProfile.picture});	
					$rootScope.user.meditation.key = key;
					Main.updateMed(newMedRef);
				}
			});
		}
	};
	this.setPresetMins = function(key, value){
		var authData = $rootScope.authData;
		fb.ref("users/"+authData.uid+"/presets/"+key+"/min").set(value);
	};
	this.setPresetHrs = function(key, value){
		var authData = $rootScope.authData;
		fb.ref("users/"+authData.uid+"/presets/"+key+"/hr").set(value);
	};
	$rootScope.auth = Auth;
    Auth.$onAuth(function(authData) {
    	if(authData){
			$rootScope.authData = authData;
			if(authData.google.cachedUserProfile.link){
				fb.ref("users/"+authData.uid).update({"user":authData.uid,"name":authData.google.displayName,"link":authData.google.cachedUserProfile.link,"photo":authData.google.cachedUserProfile.picture});
			}else{
				fb.ref("users/"+authData.uid).update({"user":authData.uid,"name":authData.google.displayName,"photo":authData.google.cachedUserProfile.picture});
			}
			var userObj = $firebaseObject(fb.ref("users/"+authData.uid));
			var userProm = userObj.$bindTo($rootScope, "user");
    		userProm.then(function(killIt){
    			ctrl.kill=killIt;
    		});
			userObj.$loaded().then(function(data){
			});
			$rootScope.medding = false;
			var now = Date.now();
			now = now-1000;
			fb.ref("check").set(now,function(err){
				if(!err){Main.checkMed();}
			});
    	}else{
    		$rootScope.authData = false;
    		if(ctrl.kill){ctrl.kill();}
			Main.checkMed();
    	}
    });
	var arr = $firebaseArray(fb.ref("meditations"));
	arr.$loaded().then(function(data) {
		var empty=true;
		angular.forEach(arr, function(val, key) {
			if(val.ends)empty=false;
		});
		if(!empty)$scope.meditations = arr;
	});
	var medObj = $firebaseObject(fb.ref("meditating"));
	medObj.$bindTo($scope, "meditating");
	$scope.greaterThan = function(now){
		return function(item){
			if (item['ends'] > now) return true;
		}
	}
	$interval(function () {
		Main.checkMed();
	}, 7000);
}])
.factory("Main", ['$firebaseObject', '$rootScope', 'fb', '$interval', function($firebaseObject, $rootScope, fb, $interval){
	var Main = {};
	Main.medTime = function(key){
		fb.ref('meditations/'+key).once('value',function(snap){
			var val=snap.val();
			var now=Date.now();
			var time=val.ends-now;
			if(time<0)return false;
			var none;
		});
	};
	Main.checkMed = function(){
		var now = Date.now();
		fb.ref("check").once("value", function(snap){
			var val = snap.val();
			if(val && now > val){
				var five = now + 5000;
				fb.ref("check").set(five);
				fb.ref("meditating").once('value', function(medSnap){
					medSnap.forEach(function(childMedSnap){
					var childMedVal = childMedSnap.val();
						if(childMedVal.ends < now){
							fb.ref("meditating/"+childMedSnap.key()).remove();
						}else{
							Main.updateMed(childMedSnap.ref());
						}
					});
				});
			}else if (val && now < val){}else{
				fb.ref("check").set(now);
			}
		});
		var authData = $rootScope.authData;
		if(authData){
			fb.ref("users/"+authData.uid+"/meditation/").once("value", function(snap){
				var val = snap.val();
				if(val && val.ends && now < val.ends){
					$rootScope.medding = true;

				}else{
					$rootScope.medding = false;
				}
			});
		}
	};
	Main.updateMed = function(ref){
		ref.once('value', function(snap){
			var now = Date.now();
			var val = snap.val();
			var hrInMs = Number(val.ends) - now;
			if(hrInMs<60000 && !timer){
				var timer = true;
				var secHand = Math.floor(hrInMs/1000);
				var countDown = $interval(function () {
					secHand = secHand-1;
					if(secHand<1){
						ref.remove();
						$interval.cancel(countDown);
					}else{
						var sec = secHand;
						if(secHand<10)sec='0'+secHand;
						ref.update({"hr":"0","min":sec,"hand":secHand,"bg":'#fff',"color":'#ccc'});
						if($rootScope.authData && val.user == $rootScope.authData.uid){
							$rootScope.user.meditation.hr = '0';
							$rootScope.user.meditation.min = sec;
						}
					}	
				}, 1000);
			}else{
				var hr = Math.floor(hrInMs/3600000);
				var minHand = Math.floor((hrInMs % 3600000)/60000)+1;
				var min = minHand;
				if(minHand>59){hr=hr+1;min='00';}else if(minHand<10){min = '0'+minHand;}else if(minHand<1){min='00';}
				if(hrInMs > 18000000){var bg = '#222';var color = '#000';}
				else if(hrInMs > 14400000){var bg = '#444';var color = '#222';}
				else if(hrInMs > 10800000){var bg = '#666';var color = '#444';}
				else if(hrInMs > 7200000){var bg = '#888';var color = '#666';}
				else if(hrInMs > 3600000){var bg = '#aaa';var color = '#888';}
				else{var bg = '#ccc';var color = '#aaa';}
				ref.update({"hr":hr,"min":min,"hand":minHand,"bg":bg,"color":color});
				if($rootScope.user && val.user == $rootScope.user.user){
					$rootScope.user.meditation.hr = hr;
					$rootScope.user.meditation.min = min;
				}
			}
		});
	};
	return Main;
}]);