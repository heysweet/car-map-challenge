define([
  'poly',
  'redblack'
],
function (
  poly,
  redblack
) {

  var tree;

  function _init() {
    tree = redblack.tree();
  }

  /**
   * Gets the associated key from a data element
   *
   * @param Object - data
   */
  function _getKey(data) {
    return data.Lat || data.y;
  }

  /**
   * Adds a trip to the tripStorage
   *
   * @param Object - data
   */
  function _push(data) {
    tree.insert(_getKey(data), data);
  }

  /**
   * Returns an iterator for values in the appropriate key range
   *
   * @param Object - polygon
   * @param function - func
   */
  function _forEachCandidateTripInPolygon(polygon, func) {
    var start, end;

    // Some assumptions of bounding box size need to be made
    // to allow for globewrapping
    if (polygon.bounds.min < -90 && polygon.bounds.max > 90) {

      // min and max will be swapped in a globewrapping situation
      start = _getKey(polygon.bounds.max);
      end = _getKey(polygon.bounds.min);

      tree.range(start, Number.MAX_VALUE).forEach(func);
      tree.range(Number.MIN_VALUE, end).forEach(func);

      return;
    }

    start = _getKey(polygon.bounds.min);
    end = _getKey(polygon.bounds.max);

    tree.range(start, end).forEach(func);
  }

  /**
   * Gets the trips from the CSV files which start and end within the given polygon
   *
   * @param Object - polygon
   */
  function _getTripsInPolygon(polygon) {
    var results = [];

    var numPoints = 0;

    var shouldDo = true;

    _forEachCandidateTripInPolygon(polygon, function (trip) {
      numPoints += 1;

      var p1 = {
        x : trip.Lon,
        y : trip.Lat
      };

      var p2 = {
        x : trip.DropoffLon,
        y : trip.DropoffLat
      };

      if (poly.isPointInPolygon(p1, polygon) && poly.isPointInPolygon(p2, polygon)) {
        results.push(trip);
      }
    });

    return results;
  }

  return {
    getTripsInPolygon : _getTripsInPolygon,
    init : _init,
    push : _push
  };

});