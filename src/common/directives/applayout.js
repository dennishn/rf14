
/*================================================================
=>                  Directive = appLayout
==================================================================*/
/*global app*/

app.directive('appLayout', ['$window', '$timeout', function ($window, $timeout) {

    'use strict';

	return {
		restrict: 'AE',
		link: function (scope, element, attrs) {
            var $element = element;

            var windowHeight = $window.innerHeight;

            $element.children().each(function(key, element) {
                $(element).css({
                    height: windowHeight/2
                });
            });

            angular.element($window).bind('resize', function(event) {
                $timeout(function() {
                    var windowHeight = $window.innerHeight;
                    $element.children().each(function(key, element) {
                        $(element).css({
                            height: windowHeight/2
                        });
                    });
                }, 100);
            })
		}
	};
}]);


/*-----  End of Directive = appLayout  ------*/
