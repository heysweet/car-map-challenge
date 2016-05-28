requirejs([
], 
function(
) {
  var map;

  window.onGoogleMapsLoad = _init;

  function _init() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 40.4585954,
        lng: -79.9691057
      },
      zoom: 7
    });

    var drawingManager = new google.maps.drawing.DrawingManager({
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
  }

  return {
    init : _init
  }
});