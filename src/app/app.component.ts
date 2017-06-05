import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
//Most of our functionality comes from these two services
import { MapService } from './services/map.service';
import { VehicleService } from './services/vehicle.service';

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html'
})
export class AppComponent  {
	constructor(
		private domSanitizer: DomSanitizer,
		private mapService: MapService,
		private vehicleService: VehicleService
	){}

	ngOnInit(){
		//on init we draw the maps, get the vehicles the first time, then every 15 seconds refresh vehicle info
		this.mapService.drawMaps();
		this.vehicleService.getVehicles();
		setInterval(()=>{
			this.vehicleService.refreshVehicles();
		},15000);
	}

	//get the size of a few of the html elements based off of zoom factor and the original size
	getZoomStyles(){
		return this.domSanitizer.bypassSecurityTrustStyle('height:'+(800*this.mapService.zoomFactor)+'px;width:'+(800*this.mapService.zoomFactor)+'px;');
	}

	//when we change the zoom recalculate the map and vehicle positions
	zoomRedraw(){
		this.mapService.redraw();
		this.vehicleService.redraw();
	}
}