
/*================================================================
=>                   Factory = firebase
==================================================================*/
/*global app*/

app.factory('firebaseFactory', ['$firebase', 'FIREBASE_URL', function ($firebase, FIREBASE_URL) {

	'use strict';

    return {
        singleMarker: function(key) {
            return $firebase(new Firebase(FIREBASE_URL + '/users/' + key));
        },
        allMarkers: function() {
            return $firebase(new Firebase(FIREBASE_URL + '/users'));
        }
    };

}]);


/*-----  End of Factory = firebase  ------*/
