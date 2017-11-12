	
	function makeBoundaryMap(){
		
		if ( vis.config.vars.projection == "mercator" ){
			
			vis.projection = d3.geoMercator()
							.scale(100)
							.translate([width/2, height/2])
							.precision(0.1);
		}
		else if ( vis.config.vars.projection == "albers" ){
			
			vis.projection = d3.geoAlbers()
							.scale(145)
							.parallels([20, 50]);
		}
		else if ( vis.config.vars.projection == "equirectangular" ){
			
			vis.projection = d3.geoEquirectangular()
							.scale(120)
							.translate([width/2,height/2])
							.rotate([0,0]);
		}
		else if ( vis.config.vars.projection == "geoEckert4" ){
			
			vis.projection = d3.geoEckert4()
							.scale(230)
							.translate([vis.width/2, vis.height/2]);
		}// end ladder ... 
		
		
		vis.zoom = d3.zoom()
			.scaleExtent([0, 10])
			.on("zoom", zoomed);
		
		vis.path = d3.geoPath().projection(vis.projection);
		
		vis.svg = d3.select("#trl-chart")
			.append("svg")
			.attr("id", "mainSvg")
			.attr("width", vis.width)
			.attr("height", vis.height);
			
		vis.toolTip = d3.select('.trl-chart').append('div')
			.attr('class', 'trl-toolTip');
			
		vis.toolTip2 = d3.select('.trl-chart').append('div')
			.attr('class', 'trl-toolTip2');
			
		vis.legend = d3.select('.trl-chart').append('div')
				.attr('class', 'trl-legend');
			
		vis.GroupCounts = [];	
//		vis.trg = {};
//		vis.src = {};
//		vis.coords = {source: vis.src, target: vis.trg};
			
		
		vis.permitted.forEach(function(d,i){
			vis.GroupCounts[i] = 0;
		})
		vis.GroupCounts[vis.permitted.length] = 0;

		d3.select("#map").attr("width", vis.width);
		
		// create array of countries relevant to story
		vis.storyCountries = _.pluck(vis.config.vars.countriesToHighlight, 'country');
	
		d3.json('../js/maldives.topo.json', function(error, world){	
		
			vis.g1 = vis.svg.append("g")
							.attr("class" , "trl-worldMap")
							.attr("id" , "trl-worldMap")
							.attr("transform", "translate(" + (-50) + "," + (-40) + ")")

			vis.g1.append('g')
				.attr('class', 'worldmap')
				.selectAll('path')
				.data(topojson.feature(world, world.objects.maldives).features)
				.enter()
				.append('path')
				.attr('data-c0', function(d) { return vis.path.centroid(d)[0]; })
				.attr('data-c1', function(d) { return vis.path.centroid(d)[1]; })
				.attr("class", function(d,i) { return "trl-country " + SpaceToUnderscore(d.properties.name) + " " + d.properties.iso_a2 + " " + d.properties.iso_a3; })
				.attr("d", vis.path)
				.attr("id", function(d,i) {
					
					if( vis.config.vars.centroidMarkers == true ){
					
						vis.g1.append("circle")
							.attr("class" , "centroidMarkers " + SpaceToUnderscore(d.properties.name))
							.attr("id" , "centroidMarker-" + SpaceToUnderscore(d.properties.name))
							.attr("cx" , d3.select(this).attr('data-c0'))
							.attr("cy" , d3.select(this).attr('data-c1'))
							.attr("r" , 2.5)
							.style("fill" , "#abcdef")
							.style("stroke" , "#0000FF")
							.style("stroke-width" , "1px")
							.on("mouseover", function(d,i){
								console.log(d3.select(this).attr("id") + " : " + d3.select(this).attr("cx") + " : " + d3.select(this).attr("cy"));
							});
					}// end if...
					
					d.countryName = d.properties.name; 
					if(vis.storyCountries.indexOf(SpaceToUnderscore(d.properties.name))!=-1 ){ $(this).addClass("trl-inList"); }
					return SpaceToHyphen(d.properties.iso_a2);
				})
				.attr("title", function(d) { return d.properties.name; })
				.style("fill", function(d,i){
					vis.result = vis.config.vars.countriesToHighlight.filter(function( ob ) {
						return SpaceToUnderscore(ob.country) == SpaceToUnderscore(d.properties.name);
					});
					
					if( vis.result.length!=0 ){
						$(this).addClass(SpaceToHyphen(vis.result[0].state));
						d3.select(this).style("opacity" , 0.9);
						vis.GroupCounts[vis.permitted.indexOf(vis.result[0].state)]++;
						return vis.result[0].fill;
					}
					else{
						$(this).addClass("trl-unreported");
						vis.GroupCounts[5]++;
					}
				})
				.style("display", function(d,i){
					
					switch( vis.config.vars.countriesToRemove.indexOf(d.properties.name) ) {
						case -1:
							return "inline";
							break;
							
						default:
							return "none";
							
					}// end switch
				})
				.on('mousemove', function(d) {
					
					d3.selectAll(".trl-country").style("pointer-events" , "auto");
					d3.selectAll(".toolTipFurniture").remove();
					$('#the-basics .typeahead').val("");
					
					vis.m = d3.mouse(this);
					vis.toolTip.style('left', Number(vis.m[0]-213) + 'px').style('top', Number(vis.m[1]-0) + 'px');
								
					vis.result = vis.config.vars.countriesToHighlight.filter(function( ob ){
						return SpaceToUnderscore(ob.country) == SpaceToUnderscore(d.properties.name)
					});
					
					if( vis.result.length!=0 ){
						var info = vis.result[0].info;
						showCountryCryptoInformation(d, info , 'map');
						
						var sel = d3.select("#"+this.id);
						sel.moveToFront();
					}	
				})
				.on("mouseover", function(d,i) {
					
					d3.selectAll(".trl-country").style("pointer-events" , "auto");
					$('#the-basics .typeahead').val("");
					d3.selectAll(".toolTipFurniture").remove();
					
					vis.result = vis.config.vars.countriesToHighlight.filter(function( ob ) {
						return SpaceToUnderscore(ob.country) == SpaceToUnderscore(d.properties.name);
					});
					
					if( vis.result.length!=0 ){
							
						d3.selectAll(".trl-country").style("opacity" ,0.2)
						d3.selectAll(".trl-country."+SpaceToUnderscore(d.properties.name)).style("opacity", 0.9).style("stroke", "#99A7B9").style("stroke-width", "1.5px");
						
						var sel = d3.selectAll(".trl-country");
						sel.moveToBack();
						
						var sel = d3.select("#"+this.id);
						sel.moveToFront();
						
						var sel = d3.selectAll(".trl-toolTip");
						sel.moveToFront();
					}
				})
				.on("mouseout", function() {

					d3.selectAll(".trl-country").style("opacity" ,0.9).style("stroke", "#ccc").style("stroke-width", "0.0px");
					vis.toolTip.style('opacity', 0);
					$(".trl-country").removeClass("trl-hovered");
				});
		
			vis.countries = topojson.feature(world, world.objects.maldives).features;
			createLegend();
			
		});

		return;
		
	}// end function makeBoundaryMap()
	
	
	
	
	
	function createLegend() {
		
		vis.legend.append('div').attr('class', 'trl-header').append('span').html('Legend');
	
		// timeseries legend
		var ts = vis.legend.append('div').attr('class', 'trl-timeseries');
		ts.append('div').attr('class', 'trl-exp').html('Levels of acceptance');

		var col1 = ts.append('div').attr('class', 'col col1'),
			col2 = ts.append('div').attr('class', 'col col2');

		vis.permitted.forEach(function(d, i) {
		
			var col = col1;
			if (i > 4) col = col2;
			var indx = col.append('div')
				.attr('class', 'trl-map_legend trl-index ' + SpaceToHyphen(d))
				.on('mousemove', function() {
					
					vis.m = d3.mouse(this);
					vis.toolTip2.style('left', Number(vis.m[0]+75) + 'px').style('top', Number(vis.m[1]+475) + 'px');
					
					d3.selectAll(".trl-map_legend.trl-index").style("opacity" , 0.25);
					d3.select(this).style("opacity" , 1.0);
					
					d3.selectAll(".trl-country").style("opacity" , 0.20).style("stroke-width" , "0.0px").style("stroke" , "#ccc");
					d3.selectAll(".trl-country."+SpaceToHyphen(d)).style("opacity" , 0.90).style("stroke-width" , "1.5px").style("stroke" , "#99A7B9");
					
					vis.result = vis.config.vars.LegendToHighlight.filter(function( ob ) {
						return ob.level == d;
					});
					
					if( vis.result.length!=0 ){
						var info = vis.result[0].info;
						showCountryAcceptanceInformation(d , info);
					}// end if ...
					
					return;
				})
				.on("mouseout" , function(d,i){
					vis.toolTip2.style('opacity', 0);
					
					d3.selectAll(".trl-country").style("opacity" , function(){
						if ( $(this).hasClass("trl-inList") ){ return 0.90; }
						else{ return 0.40; } 
					}).style("stroke-width" , "0.25px").style("stroke" , "#fff");
					d3.selectAll(".trl-map_legend.trl-index").style("opacity" , 1.00);
					
					return;
				})
			
			indx.append('div')
				.attr('class', 'trl-graphic')
				.append('svg')
				.attr('width', 30)
				.attr('height', 12)
				.append('line')
				.attr('class', "trl-"+SpaceToHyphen(d))
				.attr('x1', 0)
				.attr('x2', 30)
				.attr('y1', 9)
				.attr('y2', 9)
				.attr('stroke-width', 4)

			indx.append('div')
				.attr('class', 'trl-name')
				.style("width" , "110px")
				.html(function(){
					return (d.substr(0, 1).toUpperCase() + d.substr(1, d.length));
				})
		});

		var p = ts.append('div')
			.attr('class', 'trl-map_legend trl-index trl-unreported')
				.on("mouseover" , function(){
					d3.selectAll(".trl-map_legend.trl-index").style("opacity" , 0.25);
					d3.select(this).style("opacity" , 1.0);
					
					d3.selectAll(".trl-country").style("opacity" , 0.10).style("stroke-width" , "0.0px").style("stroke" , "#ccc");
					d3.selectAll(".trl-country.unreported").style("opacity" , 1.00).style("stroke-width" , "1.5px").style("stroke" , "#99A7B9");
					
					return;
				})
				.on("mouseout" , function(d,i){
					d3.selectAll(".trl-country").style("opacity" , 0.90);
					d3.selectAll(".trl-map_legend.trl-index").style("opacity" , 1.00);
					
					return;
				})
		p.append('div')
			.attr('class', 'trl-graphic')
			.append('svg')
			.attr('width', 30)
			.attr('height', 12)
			.append('line')
			.attr('class', 'trl-unreported')
			.attr('x1', 0)
			.attr('x2', 50)
			.attr('y1', 8)
			.attr('y2', 8)
			.attr('stroke-width', 4)
		p.append('div')
			.attr('class', 'trl-name')
			.html('Unreported')
		
		return;
		
	}// end function drawLegend();
	
	
	
	
	/*
	* Calculates the angle between AB and the X axis
	* A and B are points (ax,ay) and (bx,by)
	*/
	function getAngleDeg(ax,ay,bx,by) {
		var angleRad = Math.atan((ay-by)/(ax-bx));
		var angleDeg = angleRad * 180 / Math.PI;
		
		return(angleDeg);
		
	}// end function function getAngleDeg(ax,ay,bx,by) 
	
	
		
		
	
	function toArc(d, i){
		
		d.midWidth = d3.min([d.startWidth, d.endWidth]) + (d3.max([d.startWidth, d.endWidth]) - d3.min([d.startWidth, d.endWidth]))/2;
		
		return [{
			 x: vis.projection(d.start)[0],
			x0: vis.projection(d.start)[0],
			y0: vis.projection(d.start)[1] + d.startWidth,
			y1: vis.projection(d.start)[1] - d.startWidth,
		},
		{
			 x: (vis.projection(d.start)[0] + vis.projection(d.end)[0])/2,
			x0: (vis.projection(d.start)[0] + vis.projection(d.end)[0])/2,
			y0: (vis.projection(d.start)[1] + vis.projection(d.start)[1])/2+d.offset + d.midWidth,
			y1: (vis.projection(d.start)[1] + vis.projection(d.start)[1])/2+d.offset - d.midWidth,
		},
		{
			 x: vis.projection(d.end)[0],
			x0: vis.projection(d.end)[0],
			y0: vis.projection(d.start)[1] + d.endWidth,
			y1: vis.projection(d.start)[1] - d.endWidth
		}];
		
	}// end function toArc()
	
	
	function drawTaperedArcs(info, i){
			
		vis.g4 = vis.svg.append("g")
							.attr("class" , "trl-taperedArcs")
							.attr("id" , "taperedArcGroup-"+i)
							.attr("transform", "translate(0,0)");
							
		vis.taperedArcPath = vis.g4.append("path")
			.datum(toArc(info, i))
			.attr("class", "trl-taperedArc")
			.attr("d", taperedArcArea);
			
		vis.g4.append("circle")
			.attr("class","trl-arcStartPoint")
			.attr("id", function(d) { return info.labels[0]; })
			.attr("cx", function(d) { return vis.projection(info.start)[0]; })
			.attr("cy", function(d) { return vis.projection(info.start)[1]; })
			.attr("r", function(d) { return 2; })
			.style("display", function(d,i){
				if( vis.config.vars.taperedArcPoints == true ){ return "inline"; }
				else { return "none"; }
			});

		vis.g4.append("circle")
			.attr("class","trl-arcEndPoint")
			.attr("id", function(d) { return info.labels[1]; })
			.attr("cx", function(d) { return projection(info.end)[0]; })
			.attr("cy", function(d) { return projection(info.start)[1]; })
			.attr("r", function(d) { return 2; })
			.style("display", function(d,i){
				if( vis.config.vars.taperedArcPoints == true ){ return "inline"; }
				else { return "none"; }
			});
			
		vis.taperedArcPath.attr("d", taperedArcArea).style("fill" , info.fill).style("opacity" , info.opacity);
		vis.taperedArcPath.datum(toArc(info, i)).attr("d", taperedArcArea);
		
		/*
		* Calculates the angle between AB and the X axis
		* A and B are points (ax,ay) and (bx,by)
		*/
		info.rotation = getAngleDeg(projection(info.start)[0],projection(info.start)[1],projection(info.end)[0],projection(info.end)[1]);
		vis.svg.select("#taperedArcGroup-"+i).attr("transform", "rotate("+info.rotation+","+projection(info.start)[0]+","+projection(info.start)[1]+")");
		
		return;
		
	}// end function drawTaperedArcs()
	
	
	

	 
	
	 
	
	// Draw a set of paths (e.g storm, transit, commodity flows etc...) 
	function drawPaths(){
		
		var lastPoint;
		var thisPoint;
		var pathNumber = 0;
		var pointNumber = 0;
			
		vis.config.vars.paths.forEach(function(d,i){
			
			pointNumber = 0;
			
			vis.g3 = vis.svg.append("g").attr("class" , "trl-paths").attr("id" , "path-"+i).attr("transform", "translate(0,0)");
			
			var data = d;
			
			for (point in data){
			
				// draw path vertex point
				vis.g3.append("circle")
					.attr("class","vertex")
					.attr("id", function(d,i) { return "path-" + pathNumber + "-" + point; })
					.attr("cx", function(d) { return vis.projection(data[point].loc)[0]-0 } )
					.attr("cy", function(d) { return vis.projection(data[point].loc)[1]+3 } )
					.attr("r", function(d) { return 2; })
					.style("fill", function(d,i){ return vis.linearScale(data[point].value); })
					.style("stroke", function(d,i){ return vis.linearScale(data[point].value); })
					.style("stroke-width", "0px");
			
			
				// draw path vertex point
				vis.g3.append("text")
					.attr("class","trl-vertexLabels")
					.attr("x", function(d) { return vis.projection(data[point].loc)[0] } )
					.attr("y", function(d) { return vis.projection(data[point].loc)[1] } )
					.text(point);
					
				if( pointNumber == 0 ){
				
					thisPoint = "path-" + pathNumber + "-" + point;
					lastPoint = thisPoint;
				
				}
				else{
						
					// draw path line segment between two successive data points
					vis.g3.append("line")
						.attr("class" , "trl-trails")
						.attr("id" , function(d,i){ return "trail-"+ pointNumber; })
						.attr("x1", d3.select("#"+lastPoint).attr("cx"))
						.attr("y1", d3.select("#"+lastPoint).attr("cy"))
						.attr("x2", d3.select("#path-" + pathNumber + "-" + point).attr("cx"))
						.attr("y2", d3.select("#path-" + pathNumber + "-" + point).attr("cy"))
						.style("stroke", function(d,i){ return vis.linearScale(data[point].value); })
						.style("fill", function(d,i){ return vis.linearScale(data[point].value); })
						.style("stroke-dasharray", function(d,i){
						 	if ( data[point].projected == true ){ return "3 3"; }
						});
					
					thisPoint = "path-" + pathNumber + "-" + point;
					lastPoint = thisPoint;
					
				}// end else ...
				
				pointNumber++;
				
			}// end for ... 
			
			pathNumber++;
		
		})// end forEach...
		
		return;
		
	}//end function drawPaths() 
	 
	
	
	
	
	// Draw a set of flows 
	function drawFlows(){
		
		vis.config.vars.flows.forEach(function(d,i){
			
			vis.g1 = vis.svg.append("g").attr("class" , "trl-flows").attr("id" , "flows-"+i).attr("transform", "translate(0,0)");
			vis.g2 = vis.svg.append("g").attr("class" , "trl-labels").attr("id" , "labels-"+i).attr("transform", "translate(0,0)");
			
			vis.flows = vis.config.vars.flows[i];
			var maxVolume = d3.max(flows, function(d) { return d.vol; });
						
			routePath = vis.g1.selectAll(".trl-flow")
				.data(vis.flows)
				.enter()
				.append("path")
				.attr("class","trl-flow")
				.style("stroke-width", function(d) {  return 50 * d.vol; })
				.style("stroke", function(d) { return d.col; })
				.style("pointer-events" , "none")
				.attr('d', function(d) {
					return vis.path ({ 
					type:"LineString",
					coordinates: [ vis.config.vars.flowPoints[i][vis.config.vars.flowStartPoints[i]].loc,vis.config.vars.flowPoints[i][d.destination].loc ]
					});
				})
	
			portMarkers = vis.g1.selectAll(".trl-point")
				.data(vis.flows)
				.enter()
				.append("circle")
				.attr("class","trl-point")
				.attr("id", function(d) { return SpaceToHyphen(d.destination); })
				.attr("cx", function(d) { return projection(vis.config.vars.flowPoints[i][d.destination].loc)[0] } )
				.attr("cy", function(d) { return projection(vis.config.vars.flowPoints[i][d.destination].loc)[1] } )
				.attr("r", function(d) { return d.vol * 25 })
				.style("fill","white")
				.style("stroke-width",2)
				.style("stroke","blue");
				
			
			portLabels = vis.g2.selectAll("trl-placeLabels")
				.data(vis.flows)
				.enter()
				.append("text")
				.attr("class","trl-placeLabels")
				.attr("x", function(d) { return vis.projection(vis.config.vars.flowPoints[i][d.destination].loc)[0] + vis.config.vars.flowPoints[i][d.destination].off[0] } )
				.attr("y", function(d) { return vis.projection(vis.config.vars.flowPoints[i][d.destination].loc)[1] - vis.config.vars.flowPoints[i][d.destination].off[1] } )
				.text(function(d) { return d.destination });
				
		})// end forEach
				
		var sel = vis.svg.selectAll(".trl-flows");
		sel.moveToFront();
		
		var sel = vis.svg.selectAll(".trl-labels");
		sel.moveToFront();
		
		return;
		
	}// end function drawFlows()
	
	 
	
	function reset() {
		
		vis.active.classed("trl-active", false);
		vis.active = d3.select(null);
		
		vis.svg.transition()
			.duration(750)
			.call( vis.zoom.transform, d3.zoomIdentity );

		return;
		
	}// end function reset
	
	
	function clicked(d) {
		
		if (vis.active.node() === this) return reset();
		vis.active.classed("trl-active", false);
		vis.active = d3.select(this).classed("trl-active", true);
		
		var bounds = vis.path.bounds(d),
		dx = bounds[1][0] - bounds[0][0],
		dy = bounds[1][1] - bounds[0][1],
		x = (bounds[0][0] + bounds[1][0]) / 2,
		y = (bounds[0][1] + bounds[1][1]) / 2,
		scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
		translate = [width / 2 - scale * x, height / 2 - scale * y];
		
		vis.svg.transition()
			.duration(750)
			.call( vis.zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );

		return;
		
	}// end function clicked
		
		
	function zoomed(){
		
		
		// all updated for d3 v4
		// pan and zoom world map
		vis.g1.style("stroke-width", 1.5 / d3.event.transform.k + "px");
		vis.g1.attr("transform", d3.event.transform); 
		
		// pan and zoom points and paths
		d3.selectAll(".trl-paths").attr("transform", d3.event.transform);
		
		// pan and zoom flows and labels
		d3.selectAll(".trl-flow").attr("transform", d3.event.transform);
		d3.selectAll(".trl-point").attr("transform", d3.event.transform);
		d3.selectAll(".trl-placeLabels").attr("transform", d3.event.transform);
		

		for( var i in vis.config.vars.taperedArcs){
			vis.svg.select("#taperedArcGroup-"+i)
				.attr("transform", "rotate("+vis.config.vars.taperedArcs[i].rotation+","+vis.projection(vis.config.vars.taperedArcs[i].start)[0]+","+vis.projection(vis.config.vars.taperedArcs[i].start)[1]+")");
		}// end for ... 
		
		
		return;
		
	}// end function zoomed
	
		
	// If the drag behavior prevents the default click,
	// also stop propagation so we don’t click-to-zoom.
	function stopped() {
		
		if (d3.event.defaultPrevented) d3.event.stopPropagation();
		return;
		
	}// end function stopped