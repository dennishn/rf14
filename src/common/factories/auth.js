
/*================================================================
=>                   Factory = Auth
==================================================================*/
/*global app*/

app.factory('Auth', ['$rootScope', '$firebaseSimpleLogin', '$firebase', '$http', 'FIREBASE_URL', function ($rootScope, $firebaseSimpleLogin, $firebase, $http, FIREBASE_URL) {

	'use strict';

	var ref = new Firebase(FIREBASE_URL);

    var auth = $firebaseSimpleLogin(ref);

    var data = $firebase(ref);

    var Auth = {
        signedIn: function () {
            return auth.user !== null;
        },
        login: function (redirect) {
            if(redirect) {
                return auth.$login('facebook', {preferRedirect: true});
            }
            return auth.$login('facebook');
        },
        logout: function () {
            auth.$logout();
        },
        getUser: function() {
            return auth.$getCurrentUser();
        },
        getUserDetails: function(id) {
            return $firebase(new Firebase(FIREBASE_URL + '/users/' + id));
        },
        authorize: function(accessToken) {
            return $http.get('https://graph.facebook.com/v2.0/309401922555838?access_token=' + accessToken);
        }
    };

    $rootScope.signedIn = function () {
      return Auth.signedIn();
    };

    return Auth;

}]);


/*-----  End of Factory = Auth  ------*/
