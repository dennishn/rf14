
/*================================================================
=>                   Filter = firstName
==================================================================*/
/*global app*/

app.filter('firstName', function () {

	'use strict';

	return function (input) {
        if(input) {
		  return input.split(" ")[0];
        }

	};
});


/*-----  End of Filter = firstName  ------*/
