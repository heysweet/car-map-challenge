define([
  'mapStats'
], 
function(
  mapStats
) {
  var map;
  var drawingManager;
  var currentTrips = [];
  var markers = [];
  var topPickups = {
    markers : [],
    coords : []
  };

  /**
   * Call this method after Google Maps has been initialized to set the initial map state
   */
  function _init() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 40.6969821,
        lng: -73.9684277
      },
      zoom: 10
    });

    // Initialize the drawing manager
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON
        ]
      }
    });

    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', _onDrawingComplete);
  }

  /**
   * Adds a trip's markers to the set of markers on the map
   *
   * @param {Object} trip
   */
  function _addTripMarkers(trip) {
    markers.push(new google.maps.Marker({
      position: {
        lat : trip.Lat,
        lng : trip.Lon
      },
      map: null,
      icon: 'http://127.0.0.1:8080/blue.png'
    }));
    
    markers.push(new google.maps.Marker({
      position: {
        lat : trip.DropoffLat,
        lng : trip.DropoffLon
      },
      map: null,
      icon: 'http://127.0.0.1:8080/red.png'
    }));
  }

  /**
   * Sets the map for all markers in the array
   *
   * @param {function} returns a map based on (marker, index)
   */
  function _setMapOnAll(func) {
    for (var i = 0; i < markers.length; i++) {
      console.log(markers[i]);
      markers[i].setMap(func(markers[i], i));
    }
  }

  /**
   * Hides all markers from the map
   */
  function _hideAllMarkers() {
    _setMapOnAll(function () {
      return null;
    });

    topPickups.markers.forEach(function (marker) {
      marker.setMap(null);
    });
  }

  /**
   * Shows all markers on the map
   */
  function _showAllMarkers() {
    _setMapOnAll(function () {
      return map;
    });
  }

  /**
   * Shows only the pickup locations on the map
   */
  function _showAllPickups() {
    _setMapOnAll(function (trip, i) {
      return (i % 2) ? map : null;
    });
  }

  /**
   * Shows only the dropoff locations on the map
   */
  function _showAllDropoffs() {
    _setMapOnAll(function (trip, i) {
      return (i % 2) ? null : map;
    });
  }

  function _onGeocodeLookup(e) {
    console.log(e);
  }

  /**
   * Method called when ajax request comes back with list of JSON points
   *
   * @param {Object} event
   */
  function _onDataReceive(event) {
    currentTrips = [];

    event.responseJSON.forEach(function (trip) {
      currentTrips.push(trip);
      _addTripMarkers(trip);
    });

    topPickups = mapStats.calculateTopKPickups(currentTrips, 10);
    topPickups.markers.forEach(function (marker) {
      marker.setMap(map);
    });
  }

  /**
   * Method triggered when a shape is completed
   *
   * @param {Object} event
   */
  function _onDrawingComplete(polygon) {
    var points = [];

  	polygon.overlay.getPath().j.forEach(function (latLon) {
      points.push({
        x : latLon.lng(),
        y : latLon.lat()
      });
    });

    _setEnableDrawingTools(false);

    if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
      var radius = event.overlay.getRadius();
      return;
    }

    var data = {
      points : points
    };

    $.ajax({
      url: '/tripData',
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      complete: _onDataReceive
    });
  }

  /**
   * Sets whether or not the map drawing tools are enabled
   *
   * @param {bool} isEnabled
   */
  function _setEnableDrawingTools(isEnabled) {
    drawingManager.setMap(isEnabled ? map : null);
  }

  return {
    hideAllMarkers : _hideAllMarkers,
    init : _init,
    setEnableDrawingTools : _setEnableDrawingTools,
    showAllDropoffs : _showAllDropoffs,
    showAllMarkers : _showAllMarkers,
    showAllPickups : _showAllPickups
  }
});