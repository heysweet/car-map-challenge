define([
  'heap.min.js'
], 
function(
  Heap
) {

  var pickups = {};

  /** 
   * Performs a pushpop to ensure a limited maximum size heap
   *
   * @param {Object} heap
   * @param {int} limit
   * @param {Object} element
   */
  function _pushToHeapWithLimit(heap, limit, element) {
    if (heap.size() === limit) {
      heap.pushpop(element);
    } else {
      heap.push(element);
    }
  } 

  /** 
   * On each successive call, the heap and pickups k/v pairs are updated to
   * create a heap of the [limit] most frequented pickup locations
   *
   * @param {Object} trip - the trip to be inserted into the heap
   * @param {Object} pickups - used to store counts of all pickups whether 
   *                           inside or outside the heap
   * @param {Object} heap
   * @param {int} limit
   */
  function _updateHeap(trip, pickups, heap, limit, precision) {
    // Rounding buckets pickup locations into the same location.
    // The smaller the precision, the bigger the buckets
    var lat = parseFloat(trip.Lat.toFixed(precision));
    var lon = parseFloat(trip.Lon.toFixed(precision));
    var key = lat.toString() + ',' + lon.toString();

    if (pickups[key]) {
      pickups[key] += 1;
      console.log('HAPPENS');

      var mostFrequentPickups = heap.toArray();

      // See if it's already in the heap, and update it
      for (var i = 0; i < mostFrequentPickups.length; i++) {
        var pickup = mostFrequentPickups[i];
        
        if (pickup.key === key) {
          pickup.count = pickups[key];
          return pickups;
        }
      }

      _pushToHeapWithLimit(heap, limit, {
        key : key, 
        count : pickups[key],
        lat : lat,
        lon : lon
      });
    } else {
      pickups[key] = 1;

      _pushToHeapWithLimit(heap, limit, {
        key : key, 
        count : pickups[key],
        lat : lat,
        lon : lon
      });
    }

    return pickups;
  }

	/**
   * Determines the numTopPickups most popular pickup locations
   *
   * @param {Array} currentTrips
   * @param {int} k
   * @param {int} precision - the amount of decimal places in the latLons to
   *                use to determine a single pickup. 2 is about 10 blocks, 
   *                3 is about a block, and 4 is a couple of feet.
   */
  function _calculateTopKPickups(currentTrips, k, precision = 3) {
    var pickups = {};

    var heap = new Heap(function(a, b) {
      return a.count - b.count;
    });

    currentTrips.forEach(function (trip) {
      pickups = _updateHeap(trip, pickups, heap, k, precision);
    });

    var topPickups = {
      markers : [],
      coords : []
    };

    // Sort in descending order
    var mostFrequentPickups = heap.toArray().sort(function (a, b) {
      return b.count - a.count;
    });

    mostFrequentPickups.forEach(function (trip) {
      delete trip.key;
      topPickups.coords.push(trip);

      topPickups.markers.push(new google.maps.Marker({
        position: {
          lat : trip.lat,
          lng : trip.lon
        },
        map: null,
        icon: 'http://127.0.0.1:8080/blue.png'
      }));
    });

    console.log(topPickups);

    return topPickups;
  }

  return {
    calculateTopKPickups : _calculateTopKPickups
  };

});