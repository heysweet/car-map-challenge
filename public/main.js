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
  window.GOOGLE_MAPS_API_KEY = 'AIzaSyDmGn0JUvmkUU6PxZFLesINfa24_lJQmts';
  require(['https://maps.googleapis.com/maps/api/js?key=' + window.GOOGLE_MAPS_API_KEY + '&libraries=drawing&callback=window.onGoogleMapsLoad']);

  return {
    init : _init
  }
});