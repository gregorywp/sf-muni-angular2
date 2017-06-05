This code is live here: http://dev.gregoryprill.com/sf-muni/

Most of the important action is taking place in /src/app/ folder. The rest of this repo is from the official Angular2 quickstart seed.

This is from a challenge that reads as follows:

For this project, you will be using d3.js (http://d3js.org) to draw the real-time positions of San Francisco's buses and trains (SF Muni).
 
What To Do
 
First, you will need to display a base map of San Francisco. This zip file contains a few different versions in GeoJSON format:
***Redacted to protect anonymity of challenge origin, you can find them in the code in the /src/sfmaps/ folder***
 
Next, draw SF Muni vehicle locations on top of the map, dynamically updating their locations every 15 seconds. You can get this information from the NextBus real-time data feed. The documentation is here:
http://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf
 
Though it's undocumented, NextBus also provides this feed in JSON format. Just change "XML" to "JSON" in the URL. That is to say, you can use http://webservices.nextbus.com/service/publicJSONFeed instead of http://webservices.nextbus.com/service/publicXMLFeed.
 
Feel free to get creative with how you draw the vehicles, how you transition them to their latest positions, what other data you incorporate besides the coordinates, and so on.
 
Finally, provide a separate HTML control for selecting a subset of routes (the "routeTag" attribute in the data), e.g. show only "N" and "6".
 
Feel free to add any additional controls or interactive elements you think might be useful.
 
How To Build It
 
In addition to d3, you are welcome to use any supporting libraries or web frameworks you like, such as AngularJS, React or Angular 2. However, please do not use any non-d3 drawing libraries or out-of-the-box mapping packages such as leaflet.js.
 
Note that the NextBus server allows AJAX requests from all origins, so you can fetch the data directly from your JavaScript code, no backend required.
 
We strongly suggest you host the app in the cloud so we can test it easily.
