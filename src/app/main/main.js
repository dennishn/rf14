
/*================================================================
=>                  Controller = Main
==================================================================*/
/*global app*/

// CUSTOM OVERLAYS
// ------------------------------------------------------------

function USGSOverlay(bounds, image, map) {
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;
  this.div_ = null;
  this.setMap(map);
}

USGSOverlay.prototype = new google.maps.OverlayView({
    clickable: true
});

USGSOverlay.prototype.onAdd = function() {
    var div = document.createElement('div');
    div.style.border = "none";
    div.style.borderWidth = "0px";
    div.style.position = "absolute";
    div.className = 'festival_map';
    var obj = document.createElement("object");
    obj.type ="image/svg+xml";
    obj.data = this.image_;
    obj.style.width = "100%";
    obj.style.height = "100%";
    div.appendChild(obj);
    this.div_ = div;
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};

USGSOverlay.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  var div = this.div_;
  div.style.left = sw.x + 'px';
  div.style.top = ne.y + 'px';
  div.style.width = (ne.x - sw.x) + 'px';
  div.style.height = (sw.y - ne.y) + 'px';
};


app.controller('MainCtrl', function ($scope, $http, $q, $firebase, $firebaseSimpleLogin, FIREBASE_URL, firebaseFactory) {

    'use strict';

    $scope.map = '';
    $scope.marker = '';
    $scope.mapCenter = [55.61699, 12.08233];

    var se  =   new google.maps.LatLng(55.6076, 12.0528);
    var nw  =   new google.maps.LatLng(55.6309, 12.1097);
    var imageBounds = new google.maps.LatLngBounds(se, nw);

    $scope.markerImage = {
        url: 'img/marker.svg'
    };

    $scope.$on('mapInitialized', function(event, args) {
        $scope.map = args[0];
        new USGSOverlay(imageBounds, 'img/map.svg', $scope.map);

        $scope.markersRef = firebaseFactory.allMarkers();
        $scope.markersRef.$on("loaded", function(markers) {

            $scope.markers = markers;
            angular.forEach(markers, function(value, key) {
                var owner = value.owner;
                var markerPos = new google.maps.LatLng(value.coords.k, value.coords.A);
                $scope.lastCheckin = value.time;

                $scope.marker = new MarkerWithLabel({
                    position: markerPos,
                    map: $scope.map,
                    draggable: false,
                    labelContent: owner,
                    labelClass: 'marker__label',
                    labelInBackground: false,
                    labelAnchor: new google.maps.Point(21, 38),
                    icon: $scope.markerImage
                });

            });
        });
    });

    $scope.toggleMap = function() {
        angular.element('.festival_map').toggleClass('hidden');
    };

    // Dummy event for when user is not logged in
    $scope.addMarker = function(event) {
    };

    $scope.$watch('lastCheckin', function(newValue, oldValue) {
        console.log('derp', newValue, oldValue)
    });

    $scope.authenticate = function() {

        var dataRef = new Firebase("https://cuth.firebaseio.com");
        $scope.auth = $firebaseSimpleLogin(dataRef);

        $scope.auth.$login('facebook').then(function(user) {
            console.log(user)
            $scope.myAccesstoken = user.accessToken;
            $scope.myInit = user.displayName.charAt(0);
            $scope.userLoggedIn = true;

            $http.get('https://graph.facebook.com/v2.0/309401922555838?access_token=' + $scope.myAccesstoken).success(function(data) {

                $scope.myMarker = firebaseFactory.singleMarker(user.thirdPartyUserData.username);

                $scope.addMarker = function(event) {
                    if($scope.lastMarker) {
                        $scope.lastMarker.setMap(null);
                    }
                    if(!$scope.marker) {

                        $scope.marker = new MarkerWithLabel({
                            position: event.latLng,
                            map: $scope.map,
                            draggable: true,
                            raiseOnDrag: true,
                            labelContent: $scope.myInit,
                            labelClass: 'marker__label',
                            labelInBackground: false,
                            labelAnchor: new google.maps.Point(21, 38),
                            icon: $scope.markerImage
                        });

                        google.maps.event.addListener($scope.marker, 'click', function(event) {
                            $scope.marker.setMap(null);
                            $scope.marker = null;
                        });

                        var time = new Date();

                        $scope.markerData = {
                            coords: event.latLng,
                            owner: $scope.myInit,
                            time: time
                        };

                        $scope.lastCheckin = time;

                        $scope.myMarker.$set($scope.markerData);
                    }
                    else {
                        var time = new Date();
                        $scope.marker.setPosition(event.latLng);

                        $scope.markerData = {
                            coords: event.latLng,
                            owner: $scope.myInit,
                            time: time
                        };

                        $scope.lastCheckin = time;

                        $scope.myMarker.$set($scope.markerData);
                    }
                    google.maps.event.addListener($scope.marker, 'dragend', function() {
                        var time = new Date();

                        $scope.markerData = {
                            coords: event.latLng,
                            owner: $scope.myInit,
                            time: time
                        };

                        $scope.lastCheckin = time;

                        $scope.myMarker.$set($scope.markerData);
                    });
                }

            }).error(function(error) {

            })

        }, function(error) {
            $scope.userLoggedIn = false;
        });
    }

});


/*-----  End of Controller = Main  ------*/



