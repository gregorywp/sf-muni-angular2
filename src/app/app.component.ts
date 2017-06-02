import { Component } from '@angular/core';
import * as d3 from "d3";
import * as d3geo from "d3-geo";
import { Http } from '@angular/http';

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html'
})
export class AppComponent  {
	factor = 0.55;
	scale = 500000 * this.factor;
	x = 1069150 * this.factor;
	y = 357200 * this.factor;

	private vehicles: Array<Object>;

	constructor(
		private http: Http
	){}

	ngOnInit(){
		this.drawMaps();
		this.drawVehicles();
	}

	drawVehicles(){
		this.http.get('http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&t=0')
		.subscribe(result=>{
			this.vehicles = result.json().vehicle;
			//console.log(this.vehicles);

		    var svg = d3.select("#vehicles").append("svg")
			    .attr("width", 800)
			    .attr("height", 800);

	        // points
		    //var aa = [-122.484, 37.787];
			//var bb = [-122.484, 37.737];

			var vehicleLonLats = [];
			for(let vehicle of this.vehicles){
				vehicleLonLats.push([vehicle.lon,vehicle.lat]);
			}

			
			var scale = this.scale;
			var x = this.x;
			var y = this.y;

			var projection = d3.geoMercator().scale(scale).translate([x,y]);

	        // add circles to svg
		    svg.selectAll("circle")
				.data(vehicleLonLats).enter()
				.append("circle")
				.attr("cx", function (d) { return projection(d)[0]; })
				.attr("cy", function (d) { return projection(d)[1]; })
				.attr("r", "5px")
				.attr("fill", "red")

		});
	}

	

	drawMaps(){
		this.drawMap('sfmaps/arteries.json');
		this.drawMap('sfmaps/freeways.json');
		this.drawMap('sfmaps/neighborhoods.json');
		this.drawMap('sfmaps/streets.json');	
	}

	drawMap(mapFile){
		var scale = this.scale;
		var x = this.x;
		var y = this.y;

		d3.json(
		    mapFile,
		    function (json) {

			    var svg = d3.select("#map").append("svg")
			    .attr("width", 800)
			    .attr("height", 800);

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

			    var projection = d3.geoMercator();



				    

		    });
	}


}
