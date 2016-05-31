var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require
});

requirejs([
  'body-parser',
  'express',
  'fs',
  'path',
  'poly',
  'tripStorage'
],
function(
  bodyParser,
  express,
  fs,
  path,
  poly,
  tripStorage
) {

  var files = {};
  var trips = [];

  var app = express();
  app.use(bodyParser.json());

  tripStorage.init();

  var fieldNames = [
    'date/Time',
    'lat',
    'lng',
    'dropoffLat',
    'dropoffLng'
    // Ignore the Base field
  ];

  function loadFiles(dir) {
    fs.readdirSync(dir).forEach(function (filename) {
      if (filename[0] !== '.') {
        if (filename.indexOf('.') === -1) {
          loadFiles(dir + filename + '/');
        } else {
          var path = dir + filename;
          console.log(path);
          files[path] = fs.readFileSync(path, 'utf-8');
        }
      }
    });
  }

  // Load in files
  loadFiles('./public/');

  console.log('Loading csv data...');
  fs.readdirSync('./data/').forEach(function (filename) {
    if (filename[0] !== '.') {
      var csv = fs.readFileSync('./data/' + filename, 'utf-8').split('\r\n');

      // Skip the titles
      csv.shift();

      csv.forEach(function (line) {
        line = line.split(',');

        // Ignore Base
        line.pop();

        var row = {};
        line.forEach(function (entry, i) {
          
          // TODO: Parse dates for day/night
          if (entry.indexOf('/') === -1) {
            entry = parseFloat(entry);
          }

          row[fieldNames[i]] = entry;
        });

        // Store items in a BST
        tripStorage.push(row);
      })
    }
  });
  console.log('csv data load complete!');

  app.get('/', function (req, res) {
    res.send(files['./public/index.html']);
  });

  app.post('/tripData/', function (req, res) {
    var polyPoints = req.body.points || [];

    var polygon = poly.getPolygon(polyPoints);
    var points = tripStorage.getTripsInPolygon(polygon);

    points.forEach(function(trip) {
      delete trip['Date/Time'];
    })

    res.send(points);
  });

  app.get('/*', function (req, res) {

    var url = req.url.split('.');

    if (url[url.length - 1] === 'png' || url[url.length - 1] === 'css') {
      res.sendFile(path.join(__dirname, '/public' + req.url));
    } else {
      res.send(files['./public' + req.url]);
    }
  });

  app.listen(8080, function () {
    console.log('Server running at http://127.0.0.1:8080/');
  });

});