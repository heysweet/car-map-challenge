define([
  'map',
], 
function(
  map
) {

  /**
   * Method triggered after Google Maps has been initialized
   */
  function _init() {
    map.init();
  }

  window.onGoogleMapsLoad = _init;
  require(['https://maps.googleapis.com/maps/api/js?key=AIzaSyDmGn0JUvmkUU6PxZFLesINfa24_lJQmts&libraries=drawing&callback=window.onGoogleMapsLoad']);

  return {
    init : _init
  }
});