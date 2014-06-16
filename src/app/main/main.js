
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
    div.className = 'map__overlay';
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

app.controller('MainCtrl', function ($rootScope, $scope, $document, $timeout, $http, $q, $firebase, $firebaseSimpleLogin, FIREBASE_URL, firebaseFactory, Auth) {

    'use strict';

    cuthObj = document.getElementById('cuthLogo').cloneNode(true);
    var current_frame, total_frames, path, length, handle, l, cuthObj;

    $scope.initLogo = function() {
      current_frame = 0;
      total_frames = 60;
      path = new Array();
      length = new Array();
      for(var i=0; i<9;i++){
        path[i] = document.getElementById('i'+i);
        l = path[i].getTotalLength();
        length[i] = l;
        path[i].style.strokeDasharray = l + ' ' + l;
        path[i].style.strokeDashoffset = l;
      }
      handle = 0;
    }


    $scope.drawLogo = function() {

        var progress = current_frame/total_frames;
        if (progress > 1) {
            window.cancelAnimationFrame(handle);
            $timeout(function() {
                $scope.$emit('logo-animation-end');
                angular.element('.loader__fullscreen').addClass('leave');
                angular.element('.app-layout').addClass('enter');
            }, 1000);
        } else {
            current_frame++;
            for(var j=0; j<path.length;j++){
                path[j].style.strokeDashoffset = Math.floor(length[j] * (1 - progress));
            }
            handle = window.requestAnimationFrame($scope.drawLogo);
       }

    };

    // var dataRef = new Firebase("https://cuth.firebaseio.com");
    // $scope.auth = $firebaseSimpleLogin(dataRef);

    $scope.map = '';
    $scope.marker = '';
    $scope.markers = {};

    $scope.errorShown = false;
    $scope.backdropShown = false;

    $scope.mapCenter = [55.61699, 12.08233];

    var se  =   new google.maps.LatLng(55.6076, 12.0528);
    var nw  =   new google.maps.LatLng(55.6309, 12.1097);
    var imageBounds = new google.maps.LatLngBounds(se, nw);
    var markersArray = [];


    $scope.markerImage = {
        url: 'img/marker.svg'
    };

    $scope.initLogo();
    $scope.$on('logo-animation-end', function() {
        $rootScope.appLoading = false;
    });

    $scope.$on('mapInitialized', function(event, args) {
        $scope.map = args[0];
        new USGSOverlay(imageBounds, 'img/map.svg', $scope.map);

        $scope.markersRef = firebaseFactory.allMarkers();
        $scope.markersRef.$on("loaded", function(markers) {

            $scope.drawLogo();

            $scope.markers = markers;

            angular.forEach(markers, function(value, key) {
                if(value.coords) {
                    console.log(value)
                    var owner = value.owner;
                    var color = value.color;
                    var markerPos = new google.maps.LatLng(value.coords.k, value.coords.A);
                    $scope.lastCheckin = value.time;

                    var marker = new RichMarker({
                        position: markerPos,
                        map: $scope.map,
                        draggable: false,
                        flat:true,
                        anchor: RichMarkerPosition.TOP_LEFT,
                        content: '<span class="marker" style="background-color: ' + color + '">' + owner + '</span>'
                    });

                    var infoBubble = new InfoBubble({
                      content: '<span class="info-box">' + value.name + '</span>',
                      shadowStyle: 0,
                      arrowSize: 0,
                      borderWidth: 0,
                      borderRadius: 0,
                      backgroundColor: 'rgba(0,0,0,0)',
                      hideCloseButton: true,
                      padding: 0,
                      minHeight: 24
                    });

                    google.maps.event.addListener(marker, 'click', function(event) {
                        if(infoBubble.isOpen()) {
                            infoBubble.close();
                        } else {
                            infoBubble.open($scope.map, marker);
                        }
                    });

                    markersArray[owner] = marker;
                }

                // $rootScope.appLoading = false;
            });

        });
    });

    $scope.toggleMap = function() {
        // angular.element('.festival_map').toggleClass('hidden');
        $scope.showError('word');
    };

    $scope.showError = function(message) {
        $scope.errorShown = true;
        $scope.backdropShown = true;
        $scope.errorMessage = message;
    };
    $scope.hideError = function() {
        $scope.errorShown = false;
        $scope.backdropShown = false;
    }

    $scope.goToMarker = function(coords, owner) {
        var coords = new google.maps.LatLng(coords.k, coords.A)
        $scope.map.panTo(coords);
    }

    Auth.getUser().then(function(user) {
        if(user) {
            Auth.authorize(user.accessToken).success(function() {
               $scope.userConnection = $firebase(new Firebase(FIREBASE_URL + '/users/' + user.id));
               $scope.userConnection.$bind($scope, 'user');

               if($scope.userConnection.name) {
                    $scope.user = $scope.userConnection;
               } else {
                    $scope.user = {
                        id: user.id,
                        coords: '',
                        owner: user.displayName.charAt(0),
                        name: user.thirdPartyUserData.name,
                        time: '',
                        color: randomColor({hue: 'purple', count: 1})[0]
                    };
                    $scope.userConnection.$set($scope.user);
               }

            }).error(function(error) {
                // $rootScope.appLoading = false;
                $scope.showError(message);
            });
        } else {

        }
    }, function(error) {
        // $rootScope.appLoading = false;
    });

    $scope.addMarker = function(event) {

        if($rootScope.userLoggedIn) {
            var time = new Date();

            if($scope.lastMarker) {
                $scope.lastMarker.setMap(null);
            }

            if(!$scope.marker) {
                if(markersArray[$scope.user.owner]) {
                    console.log('im in an array');
                    var oldMarker = markersArray[$scope.user.owner];
                    oldMarker.setMap(null);
                }

                $scope.marker = new RichMarker({
                    position: event.latLng,
                    map: $scope.map,
                    draggable: false,
                    flat:true,
                    anchor: RichMarkerPosition.TOP_LEFT,
                    content: '<span class="marker" style="background-color: ' + $scope.user.color + '">' + $scope.user.owner + '</span>'
                });

                google.maps.event.addListener($scope.marker, 'click', function(event) {
                    $scope.marker.setMap(null);
                    $scope.marker = null;
                });

                $scope.userConnection.coords = event.latLng;
                $scope.userConnection.$save('coords');
                $scope.userConnection.time = time;
                $scope.userConnection.$save('time');

                // if(!$scope.markers[$scope.user.id]) {
                //     $scope.markers.push($scope.user);
                // } else {
                //     $scope.markers[$scope.user.id] = $scope.user;
                // }


            } else {

                $scope.marker.setPosition(event.latLng);

                $scope.userConnection.coords = event.latLng;
                $scope.userConnection.$save('coords');
                $scope.userConnection.time = time;
                $scope.userConnection.$save('time');

                // $scope.markers[$scope.user.owner] = $scope.user;

            }
        }
    }

    $scope.login = function() {

        $rootScope.asyncLoading = true;

        Auth.login($rootScope.isTouch).then(function(user) {

            if(user) {
                Auth.authorize(user.accessToken).success(function() {
                   // Auth.getUserDetails(user.id).$bind($scope, 'user');
                   $scope.userConnection = $firebase(new Firebase(FIREBASE_URL + '/users/' + user.id));
                   $scope.userConnection.$bind($scope, 'user');

                   if($scope.userConnection.name) {
                        $scope.user = $scope.userConnection;
                   } else {
                        $scope.user = {
                            id: user.id,
                            coords: '',
                            owner: user.displayName.charAt(0),
                            name: user.thirdPartyUserData.name,
                            time: '',
                            color: randomColor({hue: 'yellow', count: 1})[0]
                        };
                        $scope.userConnection.$set($scope.user);
                   }

                   $rootScope.asyncLoading = false;

                });
            } else {
                $rootScope.asyncLoading = false;
            }
        });

    }

    $scope.logout = function() {
        Auth.logout();
        // $scope.user = null;

    }
});
/*-----  End of Controller = Main  ------*/



