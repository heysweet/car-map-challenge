# car-map-challenge
A website for geofencing transit data.


## scripts/convertDropoffs.py

The first file of the project, this simple python script was used to format the data and generate dropoff locations.

## Using the Website 
Visit this url: <http://52.36.208.194:8080/>

Draw a polygon on the map by **clicking on the map at multiple locations, instead of dragging**. To end the polygon, either click at the start location or double click anywhere on the map to include it as the last point in the polygon.

Use the `Hide All` button any time you want to clear the represented data.

###New Shape

Click this button to clear the current context and start drawing a new polygon to look for data within.

###Hide All

Click this button to clear all data drawn on the screen, while maintaining the current polygon.

###Show All Trips

Clicking this button will display arrows leading from pickup locations to dropoff locations. Arrows that trend toward North-South will be blue, while arrows that trend toward South-North will be red. Ideally, these arrows would be gradients from blue to red, ending at the dropoff coordinates.

###Show Dropoffs

Displays all dropoff locations for trips which start and end inside the polygon. Dropoff locations are drawn as red circles.

###Show Pickups

Displays all pickup locations for trips which start and end inside the polygon. Pickup locations are drawn as blue circles.

###Show Top 10 Pickups

Displays the 10 pickup locations for trips which start and end inside the polygon that were found the most, within about a block of each other.

###Show Pickups Heatmap

Displays a heatmap of pickup locations within the given polygon. The more red the location on the heatmap, the more concentrated pickups were in that region. Zoom the map out to see more concentrated data.

###The Top 10 Pickup List

Hovering over any item in this list found in the bottom left corner will highlight the corresponding marker on the map. Clicking on the list item will zoom the map to the selected location. Each list item displays the coordinates as well as the amount of trips which started at that location within the given polygon.

## The Client

### main.js

`main.js` is the entry point into the client. It manages interfacing with all elements within the DOM that are not the Google Maps map div.

### map.js

`map.js` handles all interactions with the Google Maps API, as well as the one server call made available. Upon further inspection, I'd probably pull out the ajax call into its own ajax.js module to abstract out some of the logic, and keep this module more purely as a wrapper for the Google Maps API.

### mapStats.js

This module handles efficiently finding the top 10 pickup locations. It could easily be extended to manage any other simple statistical analyses of the data points. The choice to handle this client side was to distribute heavy lifting on the server to the clients.

### More

The client makes use of [require.js](http://requirejs.org/), [heap.js](https://www.npmjs.com/package/heap), [Bootstrap](http://getbootstrap.com/javascript/), [jQuery](https://jquery.com/), and [npm](https://www.npmjs.com/).

### Comments

The polish on the client was the last focus before finally determining an endpoint. The client is less feature rich and less polished than I was initially hoping. I'm not a designer by trade, so my prefence would be to have gotten some feedback during the creation of the actual visuals of the site. I also was hoping to turn the arrows showing trips into gradients that went from blue to red to better indicate flow around the city. The map becomes fairly unreadable when trying to access massive sections of the city due to the shear number of trips, and designing ways to reduce and combine datapoints to simplify reading the data would be another step moving forward. The focus around pickup location information rather than dropoff location information came from the prompt, and the extrapolation that the data the users would be primarily interested in was pickup information. Before writing any code, I would instead ask the target users what sort of specific information they would prefer to see.

## The Server

### server.js

This file manages the setup of the server, pre-caching of files, as well handling all incoming requests. It uses a lightweight express server.

### tripStorage.js

`tripStorage` efficiently retrieves coordinates which are likely candidates to be located within a target polygon by using a BST and using the latitudes as the key to get a pool of coordinates which exist only in the same general verticality. I chose to use a [red-black tree module](https://www.npmjs.com/package/redblack) as a simple solution to ensure a self-balancing BST and efficient lookup. I also chose to use tripStorage as a singleton, self-containing the only possible BST, to avoid generating multiple massive trees. The choice to put this server-side was to reduce the amount of data the server needed to send to the clients.

### poly.js

Poly manages checking if a point is in a polygon and related functions. It first uses a bounding box around the polygon to quickly eliminate points which could not possibly exist in the polygon before finally using a ray-casting technique [found here](http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html). It uses the parity of the number of times a ray is cast through an edge of the rectangle to determine if the point is inside or outside.

### Comments

The server is very simple by design. I wanted to use the server to do the heavy lifting of avoiding sending too many coordinates over the wire. I also stored the date/time information of hopes of moving forward with some Day/Night division, or perhaps windows of time sliders to allow querying of specific dates or hours. Ultimately given more time, creating animations of how trips change throughout the day would be a fun project to work on, that I imagine could be informative. Of course, I wouldn't move forward with a task like that unless it was a feature that was requested by the team that was going to use this.

## Additional Notes

Due to the time constraints, I just copy and pasted the Google Maps API key into the actual code. Moving forward, I would manage all secure information inside a credentials.json file located outside of the repository (.gitignore credentials.json to avoid developers accidentally pushing it).

Additionally, the user interface isn't fully intuitive. I would spend more time to make shape drawing more clear, by either allowing dragging, or the more computationally friendly choice would be to demonstrate the click-to-draw functionality.
