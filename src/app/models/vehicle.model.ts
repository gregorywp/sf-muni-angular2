import { Injectable } from '@angular/core';
import { MapService } from '../services/map.service';

@Injectable()
export class Vehicle {
	//these values should come from the feed
	public lat: number;
	public lon: number;
	public id: string;
	public routeTag: string;
	public heading: number;

	//these are the position numbers we calculate
	public cx: number;
	public cy: number;

	//other logic variables
	public timesNotFound = 0;
	public routeHide = false;
	public markForDeletion = false;

	constructor(
		private mapService: MapService,
		lat,
		lon,
		id,
		routeTag,
		heading
	){
		this.lat = lat;
		this.lon = lon;
		this.id = id;
		this.routeTag = routeTag;
		this.heading = heading;
	}

	//set vehicle svg circle cx and cy attributes based on latitude and longitude
	setXY(){
		var vehicleXY = this.mapService.projection([this.lon,this.lat]);
		this.cx = vehicleXY[0];
		this.cy = vehicleXY[1];
	}

	//determine if we have a valid heading number
	validHeading() {
		return isFinite(this.heading) && this.heading>=0;
	}

	//get points for the polygon arrow if we are using heading information
	getPolygonPoints(){
		var points = [];
		points.push( (this.cx+(3*this.mapService.zoomFactor))+','+(this.cy+(3*this.mapService.zoomFactor)) );
		points.push( this.cx+','+this.cy );
		points.push( (this.cx-(3*this.mapService.zoomFactor))+','+(this.cy+(3*this.mapService.zoomFactor)) );
		points.push( this.cx+','+(this.cy-(3*this.mapService.zoomFactor)) );

		return points.join(' ');
	}
}