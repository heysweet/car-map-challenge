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
  var lines = [];
  var topPickups = {
    markers : [],
    coords : []
  };
  var heatmap = null;
  var lastDrawing = null;

  var self = {
    getIcon : _getIcon,
    hideAll : _hideAll,
    init : _init,
    newDrawing : _newDrawing,
    setEnableDrawingTools : _setEnableDrawingTools,
    showAllDropoffs : _showAllDropoffs,
    showAllTrips : _showAllTrips,
    showAllPickups : _showAllPickups,
    showHeatmap : _showHeatmap,
    showTopPickups : _showTopPickups,
    zoomTo : _zoomTo
  }

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
      },
      polygonOptions: {
        fillColor: '#33cc33',
        fillOpacity: 0.15,
        strokeColor: '#44dd44',
        strokeOpacity: 0.667,
        strokeWeight: 3,
        clickable: false,
        editable: false,
        zIndex: 1
      }
    });

    drawingManager.setMap(map);
    _newDrawing();

    google.maps.event.addListener(drawingManager, 'overlaycomplete', _onDrawingComplete);
  }

  /**
   * Loads an icon with the corresponding image name and optional scaling 
   * variable from the server.
   *
   * @param {string} colorName
   * @param {int} scale
   */
  function _getIcon(colorName, scale = 1) {
    var halfSize = Math.floor(12 * scale);
    var size = Math.floor(24 * scale);

    var image = {
      url: 'http://127.0.0.1:8080/' + colorName + '.png',
      scaledSize: new google.maps.Size(size, size),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(halfSize, halfSize)
    };

    return image;
  }

  /**
   * Clears the currently drawn polygon as well as all corresponding 
   * data points found within the polygon.
   */
  function _newDrawing() {
    if (lastDrawing) {
      lastDrawing.overlay.setMap(null);
    }
    lastDrawing = null;

    if (typeof(self.onUpdateTopPickups) === 'function') {
      self.onUpdateTopPickups({coords : []}); 
    }

    if (heatmap) {
      heatmap.setMap(null);
    }
    heatmap = null;

    _hideAll();
    markers = [];
    topPickups = {
      markers : [],
      coords : []
    };
    lines = [];
    currentTrips = [];

    _setEnableDrawingTools(true);
  }

  /**
   * Creates a Google Maps marker which is not currently visible.
   * 
   * @param {float} lat
   * @param {float} lng
   * @param {string} color can either be 'red' or 'blue'
   */
  function _makeMarker(lat, lng, color) {
    var image = _getIcon(color);

    return new google.maps.Marker({
      position: {
        lat : lat,
        lng : lng
      },
      map: null,
      icon: image
    });
  }

  /**
   * Adds a trip's markers to the set of markers on the map
   *
   * @param {Object} trip
   */
  function _addTripMarkers(trip) {
    markers.push(_makeMarker(trip.lat, trip.lng, 'blue'));
    markers.push(_makeMarker(trip.dropoffLat, trip.dropoffLng, 'red'));
  }

  /**
   * Hides all markers from the map
   */
  function _hideAll() {
    if (heatmap) {
      heatmap.setMap(null);
    }

    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }

    lines.forEach(function (line) {
      line.setMap(null);
    });

    lines = [];

    topPickups.markers.forEach(function (marker) {
      marker.setMap(null);
    });
  }

  /**
   * Shows the heatmap
   */
  function _showHeatmap() {
    if (heatmap) {
      heatmap.setMap(map);
    }
  }

  /**
   * Shows all markers on the map
   */
  function _showAllTrips() {
    var lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      strokeOpacity : 0.3,
    };

    currentTrips.forEach(function (trip) {

      var line = new google.maps.Polyline({
        path : [
          {lat : trip.dropoffLat, lng : trip.dropoffLng},
          {lat : trip.lat, lng : trip.lng}
        ],
        icons: [{
          icon: lineSymbol,
          offset: '100%'
        }],
        strokeOpacity : 0.3,
        strokeColor : ((trip.lat - trip.dropoffLat >= 0) ? '#F00' : '#00F'),
        map: map
      });

      line.setOptions({'opacity': 0.3});

      lines.push(line);
    });
  }

  /**
   * Initializes the heatmap
   */
  function _createHeatmap() {
    if (heatmap) {
      heatmap.setMap(null);
    }

    var wrappedCoords = [];

    currentTrips.forEach(function (trip) {
      wrappedCoords.push({
        lat : function () { return trip.lat; },
        lng : function () { return trip.lng; }
      });
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: wrappedCoords,
      map: map
    });
  }

  /**
   * Shows only the pickup locations on the map
   */
  function _showAllPickups() {
    for (var i = 0; i < markers.length; i += 2) {
      markers[i].setMap(map);
    }
  }

  /**
   * Shows only the dropoff locations on the map
   */
  function _showAllDropoffs() {
    for (var i = 1; i < markers.length; i += 2) {
      markers[i].setMap(map);
    }
  }

  /**
   * Shows the top pickup locations
   */
  function _showTopPickups() {
    topPickups.markers.forEach(function (marker) {
      marker.setMap(map);
    });
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

    _createHeatmap();

    topPickups = {
      coords : mapStats.calculateTopKPickups(currentTrips, 10),
      markers : []
    };

    topPickups.coords.forEach(function (coord) {
      var marker = _makeMarker(coord.lat, coord.lng, 'blue');
      marker.setMap(map);
      topPickups.markers.push(marker);
    });

    if (typeof(self.onUpdateTopPickups) === 'function') {
      self.onUpdateTopPickups(topPickups);
    }
  }

  /**
   * Method triggered when a shape is completed
   *
   * @param {Object} event
   */
  function _onDrawingComplete(polygon) {
    lastDrawing = polygon;
    var points = [];

  	polygon.overlay.getPath().j.forEach(function (latLng) {
      points.push({
        x : latLng.lng(),
        y : latLng.lat()
      });
    });

    _setEnableDrawingTools(false);

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
   * Zooms to the given position at the given zoom level
   *
   * @param {Object} position
   * @param {int} zoom
   */
  function _zoomTo(position, zoom) {
    map.setZoom(zoom);
    map.panTo(position);
  }

  /**
   * Sets whether or not the map drawing tools are enabled
   *
   * @param {bool} isEnabled
   */
  function _setEnableDrawingTools(isEnabled) {
    drawingManager.setMap(isEnabled ? map : null);
  }

  return self;
});