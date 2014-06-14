
/*================================================================
=>                  App = rf14
==================================================================*/
/*global angular*/

var app = angular.module('rf14', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'firebase',
    'ngMap',
    'angularMoment'
]);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
	'use strict';

	$routeProvider
		.when('/', {
			templateUrl: 'app/main/main.tpl.html',
            controller: 'MainCtrl'
		})
		.otherwise({redirectTo: '/'});

	// This may help Browser-sync function properly
	// $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);


/*================================================================
=>                  rf14 App Run()
==================================================================*/

app.run(['$rootScope', '$window', 'amMoment', function ($rootScope, $window, amMoment) {

	'use strict';

    amMoment.changeLanguage('da');


    if($window.Modernizr.touch) {
        $rootScope.isTouch = true;
    } else {
        $rootScope.isTouch = false;
    }

    $rootScope.appLoading = true;
    $rootScope.asyncLoading = false;
    $rootScope.userLoggedIn = false;

    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
        $rootScope.userLoggedIn = true;
    });

    $rootScope.$on("$firebaseSimpleLogin:logout", function(e, user) {
        $rootScope.userLoggedIn = false;
    });

}]);




/* ---> Do not delete this comment (Values) <--- */

app.constant('FIREBASE_URL', 'https://cuth.firebaseio.com');
/* ---> Do not delete this comment (Constants) <--- */
