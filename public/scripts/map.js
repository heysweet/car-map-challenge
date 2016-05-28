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
        lat: 40.4585954,
        lng: -79.9691057
      },
      zoom: 7
    });

    // Initialize the drawing manager
    drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.RECTANGLE
        ]
      }
    });

    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', _onDrawingComplete);
  }

  /**
   * Method triggered when a shape is completed
   *
   * @param {Object} event
   */
  function _onDrawingComplete(event) {
  	console.log(event);
    _setEnableDrawingTools(false);

    if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
      var radius = event.overlay.getRadius();
      return;
    }
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