	/*

	Name: CRYPTOCURRENCY MAP
	Developer: J BAYLISS
	From/to: OCTOBER 2017 to _____
	Technologies: D3, Javascript, D3, Chosen, Bootstrap

	*/



	// initialise global variables.
	var graphic = $('#trl-graphic'); // set variable to DOM element to contain graphic
	var map = $('#trl-map'); // set variable to DOM element to contain graphic
	var vis = {}; // global object variable to contain all variables prefixed with 'vis.'	
	vis.pymChild = null; // initial Pym variable
	vis.margin; // initialise margin object            
	vis.svg; // vis.svg container
	
	
	vis.countryCodes = [];
	vis.permitted = [ "Global Advocates" , "Developing" , "Fence-sitters" , "Hostile" , "Banned" ];
	vis.states = [
				"Argentina", "Australia", "Austria",
				"Bangladesh", "Belgium", "Bolivia", "Brazil", "Bulgaria",
				"Canada", "Chile", "China", "Colombia", "Croatia", "Cyprus", "Czech Republic",
				"Denmark",
				"Ecuador", "Estonia",
				"Finland", "France",
				"Germany", "Greece",
				"Hong Kong", "Hungary", "Holland",
				"Iceland", "India", "Indonesia", "Iran", "Ireland", "Israel", "Italy",
				"Japan",
				"Kazakhstan", "Kenya", "Kyrgyzstan",
				"Latvia", "Lebanon", "Lithuania", "Luxembourg",
				"Malaysia", "Mexico",
				"New Zealand", "Nigeria", "Norway",
				"Pakistan", "Philippines", "Poland", "Portugal",
				"Russia",
				"Singapore", "Slovenia", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
				"Taiwan", "Thailand", "The Netherlands", "Turkey",
				"Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
				"Venezuela", "Vietnam",
				"Zimbabwe"
			];
	vis.stateAliases = [
							{ key: "Holland", value:"The Netherlands" }
						]; 
	vis.falseCentroids = [
							{ key: "France", value:[ 590.00,150.00 ] }
						];

	// browser use checking		
	vis.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	vis.isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	vis.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // At least Safari 3+: "[object HTMLElementConstructor]"
	vis.isChrome = !!window.chrome && !vis.isOpera;              // Chrome 1+
	vis.isIE = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6		
	vis.output = 'Detecting browsers by ducktyping:		';
	
	vis.output += 'vis.isFirefox: ' + vis.isFirefox + '		';
	vis.output += 'vis.isChrome: ' + vis.isChrome + '		';
	vis.output += 'vis.isSafari: ' + vis.isSafari + '		';
	vis.output += 'vis.isOpera: ' + vis.isOpera + '		';
	vis.output += 'vis.isIE: ' + vis.isIE + '		';
	
	vis.timelineIndex = 0;
	vis.g1, vis.g2, vis.g3, vis.g4;
	vis.width;
	vis.height;
	vis.active;
	vis.cryptoData;
	
	

	d3.select('.trl-toolTip').remove();
	vis.toolTip;

	d3.select('.trl-toolTip2').remove();
	vis.toolTip2;
	
	d3.selectAll('.trl-legend').remove();
	vis.legend;
	
	
	var substringMatcher = function(strs) {
		
		return function findMatches(q, cb) {
			
			var matches, substringRegex;
			
			// an array that will be populated with substring matches
			matches = [];
			
			// regex used to determine if a string contains the substring `q`
			substrRegex = new RegExp(q, 'i');
			
			// iterate through the pool of strings and for any string that
			// contains the substring `q`, add it to the `matches` array
			$.each(strs, function(i, str) {
				if (substrRegex.test(str)) {
					matches.push(str);
				}
			});
			
			cb(matches);
		};
	};
	
	$('#the-basics').bind('typeahead:selected', function(obj, datum) {
		hightlightCountry(datum);
	});
	
	
	function hightlightCountry(id){
		
		var centroidX, centroidY;
	
		d3.selectAll(".trl-country").style("pointer-events" , "none");
		vis.selectedCountry = id;
		lookup(vis.selectedCountry);
		
		function lookup( name ) {
			for( var i=0, len=vis.stateAliases.length; i<len; i++ ){
				if( vis.stateAliases[i].key === name ){
					vis.selectedCountry = vis.stateAliases[i].value;
					return true;
				}
			}
			return false;
		}
		
		if( vis.selectedCountry == '' ){
			d3.selectAll(".trl-country")
						.style("opacity", 0.9)
						.style("stroke", "#CCC")
						.style("stroke-width", "0.0px");
		}
		else{
			
			vis.countries.forEach(function(d,i){
						
				if( d.properties.name==UnderscoreToSpace(vis.selectedCountry) ){
					
					vis.userSelectedIndex = i;
					
					function lookup( name ) {
						for( var i=0, len=vis.falseCentroids.length; i<len; i++ ){
							if( vis.falseCentroids[i].key === name ){
								centroidX = vis.falseCentroids[i].value[0];
								centroidY = vis.falseCentroids[i].value[1];
								return true;
							}
						}
						return false;
					}
					
					
					if( !lookup( vis.selectedCountry ) ) {
						centroidX = d3.selectAll(".trl-country."+SpaceToUnderscore(vis.selectedCountry)).attr('data-c0');
						centroidY = d3.selectAll(".trl-country."+SpaceToUnderscore(vis.selectedCountry)).attr('data-c1');
					}
					  
					var tipHeight = d3.select(".trl-toolTip").style("height").replace("px", '');
					var tipWidth = d3.select(".trl-toolTip").style("width").replace("px", '');
					
					if( (centroidX<vis.width/2) && (centroidY<vis.height/2) ){ 
						vis.toolTipPin = [ ((vis.width*0.6)) , ((vis.height*0.5)) ];
					}
					else if( (centroidX<vis.width/2) && (centroidY>vis.height/2) ){ 
						vis.toolTipPin = [ ((vis.width*0.6)) , ((vis.height*0.35)) ];
					}
					else if( (centroidX>vis.width/2) && (centroidY>vis.height/2) ){ 
						vis.toolTipPin = [ ((vis.width*0.35)) , ((vis.height*0.35)) ];
					}
					else if( (centroidX>vis.width/2) && (centroidY<vis.height/2) ){ 
						vis.toolTipPin = [ ((vis.width*0.45)) , ((vis.height*0.5)) ];
					}
					else{
						
					}
					
					d3.selectAll(".toolTipFurniture").remove();
					
					vis.g1.append('line')
							.attr("class" ,"toolTipFurniture toolTipLinkLine")
							.attr("id" ,"toolTipLinkLine")
							.attr("x1" , centroidX )
							.attr("y1" , centroidY )
							.attr("x2" , vis.toolTipPin[0]+tipWidth/2 )
							.attr("y2" , vis.toolTipPin[1]+tipHeight/2 );
				
					vis.g1.append("circle")
						.attr("class" , "toolTipFurniture selectedCentroidMarkers")
						.attr("id" , "selectedCentroidMarker")
						.attr("cx" , centroidX)
						.attr("cy" , centroidY)
						.attr("r" , 4);
					
					d3.selectAll(".trl-country").style("opacity" ,0.2)
					d3.selectAll(".trl-country."+SpaceToUnderscore(vis.selectedCountry))
								.style("opacity", 0.9)
								.style("stroke", "#99A7B9")
								.style("stroke-width", "1.5px");
					
					vis.toolTip.style('left', Number(vis.toolTipPin[0]) + 'px').style('top', Number(vis.toolTipPin[1]) + 'px');
					
					vis.result = vis.config.vars.countriesToHighlight.filter(function( ob ) {
						return ob.country == vis.selectedCountry;
					});
					
					if( vis.result.length!=0 ){
						var info = vis.result[0].info;
						showCountryCryptoInformation(d, info, 'search');
						var sel = d3.select("#"+this.id);
						sel.moveToFront();
					}
						
				}// end if ...
				else{
				}
			})
		}
		
		return;
		
	}// end function hightlightCountry()
		
		
		
	
	$('#the-basics .typeahead').typeahead({
			hint: true,
			highlight: true,
			minLength: 1
		},
		{
			name: 'states',
			source: substringMatcher(vis.states)
		})
		.on("blur", function(e){
			d3.selectAll(".trl-country").style("pointer-events" , "auto");
		})
		.on("focus", function(e){
			d3.selectAll(".trl-country").style("pointer-events" , "none");
			
			setInterval(function(){
				d3.selectAll(".trl-country").style("pointer-events" , "auto");
			}, 500);
		});
		
			
	function resizeIframe(obj) {
		obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
	}

	
		
		
	function getCountryNameFromCode(c) {
		return vis.countryCodes[c][0]['Common Name'];
	}
	
		
	function wrangleCountryCodes(data) {
		vis.countryCodes = d3.nest()
			.key(function(d) { return d['ISO 3166-1 2 Letter Code']; })
			.map(data);
	}
	
	
	// Function for showing information tooltip when user mouses over legend
	function showCountryAcceptanceInformation(c, information) {
	
		var flagCode = c;
		var flagSpan = '<span class="trl-flag-icon trl-flag-icon-' + flagCode + '"></span>';
		
		// build-up tool tip for country hover over
		var txt = '<div class="trl-header">';
		txt += '<span class="trl-country">' + UnderscoreToSpace(c) + '</span></div>';
		txt += '<div class="trl-information">' + information + '</span></div>';	
	
		vis.toolTip2.html(txt);
		vis.toolTip2.style('opacity',0.99);
			
		var sel = d3.select('.trl-toolTip2');
		sel.moveToFront();
		
		return;
		
	}// end function showCountryAcceptanceInformation()
	
	
	
	
	
	// Function for showing information tooltip when user selects country name from typeahead
	function showCountryCryptoInformation(c, information, src) {
	
		var flagCode = vis.countryCodes["$"+c.properties.iso_a2][0]['ISO 3166-1 2 Letter Code'].toLowerCase();
		var flagSpan = '<span class="flag-icon flag-icon-' + flagCode + '"></span>';
	
		// build-up tool tip for country hover over
		var txt = '<div class="trl-header">';
		txt += '<div class="trl-flag">' + flagSpan + '</div>';
		
		if ( src == 'search' ){
			txt += '<span class="trl-country">' + UnderscoreToSpace(c.properties.name) + '</span></div>';
		}
		else {
			txt += '<span class="trl-country">' + UnderscoreToSpace(c.properties.name) + '</span></div>';
		}
		
		txt += '<div class="trl-information">' + information + '</span></div>';

		vis.toolTip.html(txt);
		vis.toolTip.style('opacity',0.99);
			
		var sel = d3.select('.trl-toolTip');
		sel.moveToFront();
		
		return;
		
	}// end function showCountryCryptoInformation()
	
	
	
	d3.selectAll(".trl-testCountryLabel").on("click", function(d,i){
		
		var datum = d3.select(this).text();
		hightlightCountry(datum); 
		
		setInterval(function(){
			d3.selectAll(".trl-country").style("pointer-events" , "auto");
		}, 500);
	})
	
	
	// initialise domain and range for colour scale associated to paths drawn
	vis.linearScale = d3.scaleLinear().domain(-1,1).range(-1,1);
	

	d3.loadData = function() {
		var loadedCallback = null;
		var toload = {};
		var data = {};
		var loaded = function(name, d) {
		  delete toload[name];
		  data[name] = d;
		  return notifyIfAll();
		};
		var notifyIfAll = function() {
		  if ((loadedCallback != null) && d3.keys(toload).length === 0) {
			loadedCallback(data);
		  }
		};
		var loader = {
		  json: function(name, url) {
			toload[name] = url;
			d3.json(url, function(d) {
			  return loaded(name, d);
			});
			return loader;
		  },
		  csv: function(name, url) {
			toload[name] = url;
			d3.csv(url, function(d) {
			  return loaded(name, d);
			});
			return loader;
		  },
		  onload: function(callback) {
			loadedCallback = callback;
			notifyIfAll();
		  }
		};
		return loader;
	  };
	
	var taperedArcArea = d3.area()
		.x(function(d) { return (d.x); })
		.x0(function(d) { return (d.x0); })
		.y0(function(d) { return (d.y0); })
		.y1(function(d) { return (d.y1); })
		.curve(d3.curveCardinal.tension(0.5));
			 

	/*
		name: 			drawGraphic
		DESCRIPTION:	Main drawing function to draw to DOM initial scarter plot view. 	
		CALLED FROM:	Pym in 	
		CALLS:			
		REQUIRES: 		n/a
		RETURNS: 		n/a
	*/
	function drawGraphic()
	{
	
		// set mobile size margins, height and width
		vis.margin = {top: vis.config.vars.margin[0], right: vis.config.vars.margin[1], bottom: vis.config.vars.margin[2], left: vis.config.vars.margin[3]}; 
		vis.width = vis.config.vars.mapDimensions[0];
		vis.height = vis.config.vars.mapDimensions[1];
			
		// update domain and range for colour scale associated to paths drawn with values taken from config file
		vis.linearScale.domain(vis.config.vars.pathGradientDomain).range(vis.config.vars.pathGradientRange);
	
    	vis.active = d3.select(null);

			
		switch (vis.config.vars.mapStyle) {
			case "boundary":
				d3.select("#trl-map").attr("width", vis.width).attr("height", vis.height);
				makeBoundaryMap();

				break;
				
			case "tile":
				d3.select("#trl-map").style("width", vis.width+"px").style("height", vis.height+"px");
				makeTileMap();
				break;
				
		}// end switch
		
		setupExpandClicks();
		
		//use pym to calculate trl-chart dimensions	
		if (vis.pymChild) { vis.pymChild.sendHeight(); }
		
		
		return;
		 

	} // end function drawGraphic()








	/*
		NAME: 			buildUI
		DESCRIPTION: 	function to build intitial UI interface.
		CALLED FROM:	Modernizr.inlinesvg
		CALLS:			n/a
		REQUIRES: 		n/a	
		RETURNS: 		n/a		
	*/
	function buildUI(){	
			
		switch (vis.config.vars.headers){
			
			case true:	
				$(".row.headers").show();
				
				d3.select("#mainHeader").text(vis.config.vars.mainHeader);
				d3.select("#subHeader").text(vis.config.vars.subHeader);
				d3.select("#information").text(vis.config.vars.information);
				break;
			default:
				$(".row.headers").hide();
				break;
				
		}// end switch
		
			
		switch (vis.config.vars.legend) {
			
			case "horizontal":
				$(".row.vertical").remove();
				$(".row.horizontal").show();
				break;
			case "vertical":
				$(".row.vertical").show();
				$(".row.horizontal").remove();
				break;
				
		}// end switch
		
		
		//loadData();
		
			
		return;
		
	} // end function buildUI()
	
	
	
	function loadData(){
		
		d3.queue()
			/*.defer(d3.csv, vis.config.vars.dataFile)*/
			.defer(d3.csv, vis.config.vars.countriesFile)
			/*.defer(d3.json, vis.config.vars.dataFile3)*/
			.awaitAll(function ready(error, results, treemapData) {
				if (error) throw error;
				globaliseData(results);
				//drawTopChart(treemapData);
			});
		
		return;
		
	}//end function loadData()
	
	
	
	
	function globaliseData(data){
		
		vis.countryData = data[0];
		wrangleCountryCodes(vis.countryData);
		
		return;
		
	}// end function globaliseData() 
	
	
	
	

	/*
	NAME: 			transitionData
	DESCRIPTION: 	function used to transition all and/or selected grouped dots plus related voronoi layers
	CALLED FROM:	clickPillGroups
					drawGraphic
	CALLS:			showtooltip
					hidetooltip
	REQUIRES: 		n/a
	RETURNS: 		n/a
	*/
	function transitionData()
	{

	return;
	 
	}// end transitionData()

				
				
	/*==========  expandable sections  ==========*/
	
	function setupExpandClicks() {
		
		$('.trl-more .trl-reveal').slideToggle(0);
	
		$('.trl-explanation .trl-more .trl-trigger').click(function(){
			var r = $(this).parent().find('.trl-reveal');
			if ( r.css('display') == 'none') {
				$(this).html('less...'); 
			} else {
				$(this).html('more...')
			}
			r.slideToggle();
		});
	
		$('.trl-notes .trl-more .trl-trigger').click(function() {
			var r = $(this).parent().find('.trl-reveal');
			if ( r.css('display') == 'none') {
				$(this).html('Click to hide data sources and methodology'); 
			} else {
				$(this).html('Click to show data sources and methodology')
			}
			r.slideToggle();
		});
	}

				
							

	//then, onload, check to see if the web browser can handle 'inline vis.svg'
	if (Modernizr.inlinesvg)
	{


		// open and load configuration file. 					
		d3.json("../data/config.json", function(error, json)
		{	

								
			// store read in json data from config file as as global vis. variable ...	
			vis.config = json;
			
			
			// call functionm to draw initial UI on load.
			buildUI();
			loadData();
			vis.pymChild = new pym.Child({renderCallback: drawGraphic});
		
		})// end 


	} // end if ... 
	else {


		//use pym to create iframe containing fallback image (which is set as default)
		vis.pymChild = new pym.Child();
		if (vis.pymChild) { vis.pymChild.sendHeight(); }
	}	
	
	


function screenResize() {
	// http://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
	var width = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;

	var height = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;


	// $('.trl-chart').css('height', (height - 0) + 'px');

	width = $('.trl-chart').width();
	height = $('.trl-chart').height();

	// vis.screenSize = [width, height];
	// vis.riotHeight = height * 0.2;
	// vis.chartHeight = height * 0.3;
	// vis.tooltipHeight = height * 0.4
	// vis.touchLineHeight = height * 0.2;

	if (vis.dataLoaded) { renderChart(); }

	trace('screenResize: ' + width + ' x ' + height);
}

function setupResize() {
	window.addEventListener('resize', updateLayout, false);
	screenResize();
}