import { Injectable } from '@angular/core';
import * as d3 from "d3";
import * as d3geo from "d3-geo";

@Injectable()
export class MapService {
	//These variables are what was needed to display the map in the right spot, admittedly mostly trial and error although I know I could have calculated it
	public zoomFactor = 1;
	public tempZoomFactor = 1;
	private factor = 0.55 * this.zoomFactor;
	private scale = 500000 * this.factor;
	private mapX = 1069150 * this.factor;
	private mapY = 357200 * this.factor;
	public projection = d3.geoMercator().scale(this.scale).translate([this.mapX,this.mapY]);

	//radius of our circles, will be multiplied by zoom
	public radius = 3;

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

		    	//using our map container and setting height and width
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

	//redraw maps on zoom
	redraw(){
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
	}

}