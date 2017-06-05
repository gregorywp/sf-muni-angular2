import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Vehicle } from '../models/vehicle.model';
import { Route } from '../models/route.model';
import * as _ from 'underscore';
import { MapService } from './map.service';

@Injectable()
export class VehicleService {
	public vehicles: Array<Vehicle>;
	private routes: Array<Route>;

	//vehicle information url
	private apiUrl = 'http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&t=0';

	constructor(
		private http: Http,
		private mapService: MapService
	){
		this.vehicles = [];
	}

	//used only the first time we get information
	getVehicles(){
		this.http.get(this.apiUrl)
		.subscribe(result=>{
			//initialize our vehicles as the ones returned
			let newVehicles = result.json() && result.json().vehicle;
			for(let newVehicle of newVehicles){
				this.vehicles.push(new Vehicle(this.mapService,newVehicle.lat,newVehicle.lon,newVehicle.id,newVehicle.routeTag,newVehicle.heading));
				//for each vehicle set an x and y position based on its coordinates
				this.vehicles[this.vehicles.length-1].setXY();
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
			var newVehicles = result.json() && result.json().vehicle;

			//loop through our existing vehicles
			for(let vehicle of this.vehicles){
				//see if we have a new vehicle with the same id
				var newVehicleWithID = _.find(newVehicles, function(newVehicle){ return newVehicle.id == vehicle.id; });
				//if we do have a new vehicle with the same id update the coordinates of the existing vehicle
				if(newVehicleWithID){
					newVehicleWithID.found = true;
					vehicle.lat = newVehicleWithID.lat;
					vehicle.lon = newVehicleWithID.lon;
					vehicle.setXY();
					vehicle.timesNotFound = 0;
				//if we didn't find a vehicle in the new array then remember how many times and if it has been 4 times remove the vehicle
				} else {
					vehicle.timesNotFound = typeof vehicle.timesNotFound === undefined ? 1 : vehicle.timesNotFound + 1;
					if(vehicle.timesNotFound == 4){
						vehicle.markForDeletion = true;
					}
				}
			}
			//if a new vehicle wasn't found in the old ones, add it to the old ones and set its coordinates
			for(let newVehicle of newVehicles){
				if(!newVehicle.found){
					this.vehicles.push(new Vehicle(this.mapService,newVehicle.lat,newVehicle.lon,newVehicle.id,newVehicle.routeTag,newVehicle.heading));
					this.vehicles[this.vehicles.length-1].setXY();
				}
			}

			//remove vehicles marked for deletion
			for(var i=this.vehicles.length-1; i>=0; i--){
				if(this.vehicles[i].markForDeletion){
					this.vehicles.splice(i,1);
				}
			}

			//set route information
			this.setRoutes();

			//set what vehicles are hidden by route selection
			this.setRouteHide();
		});
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

	//redraw the vehicles on zoom
	redraw(){
		//recalculate our vehicle values, setting them to null first and then a short wait so we don't have the transition
		for(let vehicle of this.vehicles){
			vehicle.cx = null;
			vehicle.cy = null;
			setTimeout(()=>{
				vehicle.setXY();
			},50);
		}
	}
}