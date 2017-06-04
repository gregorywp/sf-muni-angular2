import { Component } from '@angular/core';
import * as d3 from "d3";
import * as d3geo from "d3-geo";
import { Http } from '@angular/http';
import * as _ from 'underscore';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html'
})
export class AppComponent  {
	//These variables are what was needed to display the map in the right spot, admittedly mostly trial and error although I know I could have calculated it
	private zoomFactor = 1;
	private tempZoomFactor = this.zoomFactor;
	factor = 0.55 * this.zoomFactor;
	scale = 500000 * this.factor;
	mapX = 1069150 * this.factor;
	mapY = 357200 * this.factor;
	projection = d3.geoMercator().scale(this.scale).translate([this.mapX,this.mapY]);
	private radius = 3;

	//we will be storing vehicles and routes each in one array
	private vehicles: Array<Vehicle>;
	private routes: Array<Route>;

	//vehicle information url
	apiUrl = 'http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&t=0';

	constructor(
		private http: Http,
		private domSanitizer: DomSanitizer
	){}

	ngOnInit(){
		//on init we draw the maps, get the vehicles the first time, then every 15 seconds refresh vehicle info
		this.drawMaps();
		this.getVehicles();
		setInterval(()=>{
			this.refreshVehicles();
		},15000);
	}

	//used only the first time we get information
	getVehicles(){
		this.http.get(this.apiUrl)
		.subscribe(result=>{
			//initialize our vehicles as the ones returned
			this.vehicles = result.json().vehicle;

			//for each vehicle set an x and y position based on its coordinates
			for(let vehicle of this.vehicles){
				this.setXY(vehicle,vehicle.lon,vehicle.lat);
			}

			//set route information
			this.setRoutes();
		});
	}

	//the function called at every time interval
	refreshVehicles() {
		this.http.get(this.apiUrl)
		.subscribe(result=>{
			//set a new array of the returned vehicles to process before using
			var newVehicles = result.json().vehicle;

			//loop through our existing vehicles
			for(let vehicle of this.vehicles){
				//see if we have a new vehicle with the same id
				var newVehicleWithID = _.find(newVehicles, function(newVehicle){ return newVehicle.id == vehicle.id; });
				//if we do have a new vehicle with the same id update the coordinates of the existing vehicle
				if(newVehicleWithID){
					newVehicleWithID.found = true;
					this.setXY(vehicle,newVehicleWithID.lon,newVehicleWithID.lat);
					vehicle.timesNotFound = 0;
				//if we didn't find a vehicle in the new array then remember how many times and if it has been 4 times remove the vehicle
				} else {
					vehicle.timesNotFound = typeof vehicle.timesNotFound === undefined ? 1 : vehicle.timesNotFound + 1;
					if(vehicle.timesNotFound == 4){
						this.vehicles.splice(this.vehicles.indexOf(vehicle),1);
					}
				}
			}
			//if a new vehicle wasn't found in the old ones, add it to the old oens and set its coordinates
			for(let newVehicle of newVehicles){
				if(!newVehicle.found){
					this.vehicles.push(newVehicle);
					this.setXY(this.vehicles[this.vehicles.length-1],this.vehicles[this.vehicles.length-1].lon,this.vehicles[this.vehicles.length-1].lat);
				}
			}

			//set route information
			this.setRoutes();

			//set what vehicles are hidden by route selection
			this.setRouteHide();
		});
	}

	//set vehicle svg circle cx and cy attributes based on latitude and longitude
	setXY(vehicle,lon,lat){
		var vehicleXY = this.projection([lon,lat]);
		vehicle.cx = vehicleXY[0];
		vehicle.cy = vehicleXY[1];
	}

	//set route information
	setRoutes(){
		var newRoutes = [];
		//loop through vehicles
		for(let vehicle of this.vehicles){
			//if we haven't found a route on this vehicle yet then add it to the array of routes and set color by hashed route name
			if(!_.find(newRoutes, function(newRoute){ return newRoute.name == vehicle.routeTag })){
				newRoutes.push({
					name: vehicle.routeTag,
					color: this.hashColor(vehicle.routeTag)
				});

				//check if we have an existing route to match the new one and if we do make sure we preserve its selected status
				var existingRoute = _.find(this.routes, function(route){ return route.name == vehicle.routeTag });
				if(existingRoute){
					newRoutes[newRoutes.length-1].selected = existingRoute.selected;
				}
			}
		}

		//set our routes to the processed new ones sorted by name
		this.routes = _.sortBy(newRoutes, function(newRoute){ return newRoute.name; });
	}

	//gets called at beginning, load up our nice looking maps
	drawMaps(){
		this.drawMap('sfmaps/arteries.json');
		this.drawMap('sfmaps/freeways.json');
		this.drawMap('sfmaps/neighborhoods.json');
		this.drawMap('sfmaps/streets.json');	
	}

	//given a map file draw it in the right size and place
	drawMap(mapFile){
		var scale = this.scale;
		var x = this.mapX;
		var y = this.mapY;
		var zoomFactor = this.zoomFactor;

		d3.json(
		    mapFile,
		    function (json) {

		    	//useing our map container and setting height and width
			    var svg = d3.select("#map").append("svg")
			    .attr("width", 800*zoomFactor)
			    .attr("height", 800*zoomFactor);

			    var theThis = this;

			    //create geo.path object, set the projection to merator bring it to the svg-viewport
			    var path = d3.geoPath()
			        .projection(d3.geoMercator()
			        .scale(scale)
			        .translate([x,y])
			        );

			    //draw svg lines of the boundries
			    svg.append("g")
			        .attr("class", "black")
			        .selectAll("path")
			        .data(json.features)
			        .enter()
			        .append("path")
			        .attr("d", path);
		    });
	}

	//given a string return a color based on the hash, so we can match colors to routes
	hashColor(string){
		return this.intToRGB(this.hashCode(string+string+string+string+string+string));
	}

	//return a hash code of a string
	hashCode(str) {
	    var hash = 0;
	    for (var i = 0; i < str.length; i++) {
	       hash = str.charCodeAt(i) + ((hash << 5) - hash);
	    }
	    return hash;
	}

	//convert an integer to a RGB hex string
	intToRGB(i){
	    var c = (i & 0x00FFFFFF)
	        .toString(16)
	        .toUpperCase();

	    return "000000".substring(0, 6 - c.length) + c;
	}

	//set whether or not a vehicle is hidden based on what route its on and the route view controls
	setRouteHide(){
		//find what routes are selected
		var selectedRoutes = _.filter(this.routes, function(route){ return route.selected; });
		//if no routes selected all vehicles should show
		if(selectedRoutes.length==0){
			for(let vehicle of this.vehicles){
				vehicle.routeHide = false;
			}
		//if some routes are selected hide vehicles if their route is not selected
		} else {
			for(let vehicle of this.vehicles){
				vehicle.routeHide = typeof _.find(selectedRoutes, function(route){ return route.name == vehicle.routeTag; }) === 'undefined';
			}
		}
	}

	//when we click a route button just toggle its selected status and then reset our vehicles' route hide status
	setSelectedRoute(route){
		route.selected = !route.selected;
		this.setRouteHide();
	}


	//when we click the reset button for routes make them all not selected and reset our vehicles' route hide status
	resetRoutes(){
		for(let route of this.routes){
			route.selected = false;
		}
		this.setRouteHide();
	}

	//get the size of a few of the html elements based off of zoom factor and the original size
	getZoomStyles(){
		return this.domSanitizer.bypassSecurityTrustStyle('height:'+(800*this.zoomFactor)+'px;width:'+(800*this.zoomFactor)+'px;');
	}

	//when we change the zoom recalculate some values
	zoomRedraw(){
		//recalculate our base positioning values
		this.zoomFactor = this.tempZoomFactor;
		this.factor = 0.55 * this.zoomFactor;
		this.scale = 500000 * this.factor;
		this.mapX = 1069150 * this.factor;
		this.mapY = 357200 * this.factor;
		this.projection = d3.geoMercator().scale(this.scale).translate([this.mapX,this.mapY]);
		this.radius = 3 * this.zoomFactor;

		//remove the maps and then right away redraw them to the new size
		d3.selectAll("#map svg").remove();
		this.drawMaps();

		//recalculate our vehicle values, setting them to null first and then a short wait so we don't have the transition
		for(let vehicle of this.vehicles){
			vehicle.cx = null;
			vehicle.cy = null;
			setTimeout(()=>{
				this.setXY(vehicle,vehicle.lon,vehicle.lat);
			},50);
		}
	}

	//not used, but if it was it would be to determine if we have a valid heading number
	validHeading(n) {
		return !isNaN(parseFloat(n)) && isFinite(n) && n>=0;
	}

	//get points for the polygon arrow if we are using heading information
	getPoints(cx,cy){
		var points = [];
		points.push( (cx+(3*this.zoomFactor))+','+(cy+(3*this.zoomFactor)) );
		points.push( cx+','+cy );
		points.push( (cx-(3*this.zoomFactor))+','+(cy+(3*this.zoomFactor)) );
		points.push( cx+','+(cy-(3*this.zoomFactor)) );

		return points.join(' ');
	}
}
//necessary interfaces for angular to not complain what is and isn't in an object
interface Vehicle {
	lat?: number;
	lon?: number;
	cx?: number;
	cy?: number;
	id?: string;
	timesNotFound: number;
	routeTag?: string;
	routeHide: boolean;
}

interface Route {
	name: string;
	color: string;
	selected: boolean;
}