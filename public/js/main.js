define([
  'map',
], 
function(
  map
) {

  var buttonsIds = [
    "newShape",
    "hideAll",
    "showAll",
    "showDropoffs",
    "showPickups",
    "showTop10",
    "showHeatMap"
  ];
  
  var buttons = {};

  buttonsIds.forEach(function (buttonId) {
    var button = document.getElementById(buttonId);
    buttons[buttonId] = button;
  });

  // Link each of the buttons on the interface to the corresponding map actions
  buttons["newShape"].onclick = map.newDrawing;
  buttons["showAll"].onclick = map.showAllTrips;
  buttons["hideAll"].onclick = map.hideAll;
  buttons["showDropoffs"].onclick = map.showAllDropoffs;
  buttons["showPickups"].onclick = map.showAllPickups;
  buttons["showTop10"].onclick = map.showTopPickups;
  buttons["showHeatMap"].onclick = map.showHeatmap;

  /**
   * Method triggered after Google Maps has been initialized
   */
  function _init() {
    map.init();
  }

  /**
   * Sets up the hover functionality surrounding the list elements
   *
   * @param {Object} topTenPickups {coords : Array, markers : Array}
   */
  function _setupListHover(topTenPickups) {
    $('li').hover(function () {
      $( this ).addClass( "hover" );

      var index = $('li').index(this);
      var marker = topTenPickups.markers[index];

      var icon = map.getIcon('lightBlue', 1.3);
      marker.setIcon(icon);

    }, function () {
      $( this ).removeClass( "hover" );

      var index = $('li').index(this);
      var marker = topTenPickups.markers[index];

      var icon = map.getIcon('blue');
      marker.setIcon(icon);
    });

    $('li').click(function () {
      var index = $('li').index(this);
      var marker = topTenPickups.markers[index];

      map.zoomTo(marker.position, 15);
    });
  }

  /**
   * Method called when top pickups are recalculated.
   *
   * @param {Object} topTenPickups {coords : Array, markers : Array}
   */
  map.onUpdateTopPickups = function (topTenPickups) {
    var list = $('#list');
    list.empty();

    topTenPickups.coords.forEach(function (coord) {
      list.append('<li>(' + coord.lat + ', ' + coord.lng + '): ' + coord.count + '&nbsp;pickups</li>');
    });

    _setupListHover(topTenPickups);
  }

  window.onGoogleMapsLoad = _init;
  window.GOOGLE_MAPS_API_KEY = 'AIzaSyDmGn0JUvmkUU6PxZFLesINfa24_lJQmts';
  require(['https://maps.googleapis.com/maps/api/js?key=' + window.GOOGLE_MAPS_API_KEY + '&libraries=drawing,visualization&callback=window.onGoogleMapsLoad']);

  return {
    init : _init
  }
});