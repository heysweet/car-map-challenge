define([
], 
function(
) {
  var map;
  var drawingManager;

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

  function _onDataReceive(event) {
    event.responseJSON.forEach(function (trip) {
      new google.maps.Marker({
        position: {
          lat : trip.Lat,
          lng : trip.Lon
        },
        map: map,
        icon: 'http://127.0.0.1:8080/blue.png'
      });
      
      new google.maps.Marker({
        position: {
          lat : trip.DropoffLat,
          lng : trip.DropoffLon
        },
        map: map,
        icon: 'http://127.0.0.1:8080/red.png'
      });
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
    init : _init,
    setEnableDrawingTools : _setEnableDrawingTools
  }
});