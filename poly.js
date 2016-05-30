define([
],
function (
) {

  /**
   * Returns true if the point is inside the polygon.
   *
   * @param Object - point
   * @param Object - polygon
   */
  function _isPointInPolygon(pt, polygon) {

    if (pt.x > polygon.bounds.max || pt.x < polygon.bounds.min ||
        pt.y > polygon.bounds.max || pt.y < polygon.bounds.min) {
      return false;
    }

    /**
     * Rays cast from the input point through every edge should
     * cross an odd number of times through edges of a polygon
     * if the point is inside the polygon
     */
    if (polygon.points.length < 3) {
      // Not a valid polygon
      return false;
    }

    var p1 = polygon.points[0];

    var inside = false;
    for (var i = 1; i <= polygon.points.length; i++) {
      var p2 = polygon.points[i % polygon.points.length];

      // Based on ray-casting work from
      // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
      var intersect = ((p1.y > pt.y) != (p2.y > pt.y)) &&
            (pt.x < (p2.x - p1.x) * (pt.y - p1.y) / (p2.y - p1.y) + p1.x);
      
      if (intersect) {
        inside = !inside;
      }

      p1 = p2;
    }

    return inside;
  }

  /**
   * Converts array of points into Polygon object
   * 
   * @param Array - points
   */
  function _getPolygon(points) {
    return {
      bounds : _getBoundingBox(points),
      points : points
    };
  }

  /**
   * Returns the smallest non-rotated rectangle which contains the polygon
   *
   * @param Array - points
   */
  function _getBoundingBox(points) {
    var result = {
      min : {
        x : Number.MAX_VALUE,
        y : Number.MAX_VALUE
      },
      max : {
        x : Number.NEGATIVE_INFINITY,
        y : Number.NEGATIVE_INFINITY
      }
    }

    points.forEach(function (point) {
      result.min.x = Math.min(point.x, result.min.x);
      result.min.y = Math.min(point.y, result.min.y);
      result.max.x = Math.max(point.x, result.max.x);
      result.max.y = Math.max(point.y, result.max.y);
    });

    return result;
  }

  return {
    isPointInPolygon : _isPointInPolygon,
    getBoundingBox : _getBoundingBox,
    getPolygon : _getPolygon
  }
});