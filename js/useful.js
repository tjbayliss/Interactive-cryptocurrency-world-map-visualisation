// JavaScript Document
		
	
	
	
	
	//function to return random point in a circle's circumference
	function getRandomPoint(radius) {
					
		var angle = Math.random() * Math.PI * 2;		
		return { x: Math.cos(angle) * radius , y: Math.sin(angle) * radius };
	}
		
	
	
	
	
	//function to return inverse of the supplied hexcode color
	function invertColour(color)
	{
		return '#' + ("000000" + (0xFFFFFF ^ parseInt(color.substring(1),16)).toString(16)).slice(-6);
	}
  
  
  
	
	
	// Random color generator in JavaScript
	function getRandomColor() {
		
		var letters = '0123456789ABCDEF';
		var color = '#';
		
		for (var i = 0; i < 6; i++ ) { color += letters[Math.floor(Math.random() * 16)]; }
		return color;
		
	}// end getRandomColor()



	
	
	// add comma seperators to numebrs over/under +/-999
	function numberWithCommas(x)
	{
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
		
		
	
	function UnderscoreToSpace(str)
	{
        // the str can be undefined, in this case return nothing
	    if (str === undefined) {
             return;
        }
        else {
             return str.split('_').join(' ');
        }
	}
		
		
	
	function SpaceToUnderscore(str)
	{
        // the str can be undefined, in this case return nothing
	    if (str === undefined) {
             return;
        }
        else {
             return str.split(' ').join('_');
        }
	}
	
	
	
	function HyphenToSpace(str)
	{
		return /*str.replace('-' , ' ');*/str.split('-').join(' ');
	}
		
		
	
	function SpaceToHyphen(str)
	{
        // the str can be undefined, in this case return nothing
	    if (str === undefined) {
             return;
        }
        else {
             return str.split(' ').join('-');
        }
	}
	
		
		
		
		
	
	function toTitleCase(str)
	{
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
		
		
		
	/*	
	
	String.prototype.trunc =
		function( n, useWordBoundary ){
			
			var isTooLong = this.length > n,
			s_ = isTooLong ? this.substr(0,n-1) : this;	
			s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
			
			return  isTooLong ? s_ + '&hellip;' : s_;
		};*/
  
	String.prototype.trunc =
     function( n, useWordBoundary ){
         if (this.length <= n) { return this; }
         var subString = this.substr(0, n-1);
         return (useWordBoundary 
            ? subString.substr(0, subString.lastIndexOf(' ')) 
            : subString) + "...";
      };
	
	
	
	// http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
	d3.selection.prototype.moveToFront = function() {
		return this.each(function(){
			this.parentNode.appendChild(this);
		});
	};
	d3.selection.prototype.moveToBack = function() { 
		return this.each(function() { 
			var firstChild = this.parentNode.firstChild; 
			if (firstChild) { 
				this.parentNode.insertBefore(this, firstChild); 
			} 
		}); 
	};
	
		
	
	// function to wrap long lines to defined width. can be used for labels, strings, axis titles etc.
	function wrap(text, content_width/* , article_ID, containerNumber*/) {
		
		text.each(function() {
			var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 10/*1.1*/, // ems
			y = text.attr("y"),
			dy = 0.0/*parseFloat(text.attr("dy"))*/,
			tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy/* + "em"*/);
			
			while (word = words.pop()) {
				line.push(word);
				
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > content_width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy).text(word);
					
					vis.lineCount++;
				}
			}
		});
		
		return;
		
	}// end function wrap()