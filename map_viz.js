
// Set up size
var width = 750,
	height = width;

// Set up projection that map is using
var projection = d3.geo.mercator()
	.center([-122.433701, 37.767683]) // San Francisco, roughly
	.scale(225000)
	.translate([width / 2, height / 2]);
// This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
// projection([lon, lat]) returns [x, y]

// Add an svg element to the DOM
var svg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

// Add svg map at correct size, assumes map is saved in a subdirectory called "data"
svg.append("image")
          .attr("width", width)
          .attr("height", height)
          .attr("xlink:href", "data/sf-map.svg");


d3.json("data/scpd_incidents.json", function(error, data) {
  // This function gets called when the request is resolved (either failed or succeeded)

  if (error) {
    // Handle error if there is any
    return console.warn(error);
  }

  data = data["data"];

  // If there is no error, then data is actually ready to use
  svg.selectAll("circle")
		.data(data).enter()
		.append("circle")
		.attr("cx", function (d) { return projection(d.Location)[0]; })
		.attr("cy", function (d) { return projection(d.Location)[1]; })
		.attr("r", "2px")
		.attr("fill", "black")
		.attr("visibility", "hidden");
   visiblePoints();

});

var sidebar_width = $("#side_panel").width();

// SETTING AREA CIRCLES

var area_radius = 500;

var area_A = svg.append("circle")
                 .attr("cx", 300)
                 .attr("cy", 300)
                 .attr("r", area_radius*.5)
                 .attr("fill", "white")
                 .attr("stroke", "red")
                 .attr("stroke-width", "3")
                 .attr("stroke-opacity", "1.0")
                 .attr("fill-opacity", "0.0")                 
                 .attr("z-index", "100")
                 .attr("id", "area_A");

var area_B = svg.append("circle")
                 .attr("cx", 400)
                 .attr("cy", 300)
                 .attr("r", area_radius*.5)
                 .attr("fill", "white")
                 .attr("stroke", "blue")
                 .attr("stroke-width", "3")
                 .attr("stroke-opacity", "1.0")
                 .attr("fill-opacity", "0.0")
                 .attr("z-index", "100")
                 .attr("id", "area_B");


// MOVING AREA CIRCLES CODE

var mousedown_A = false;
var mousedown_B = false;

$("#map").mouseup(function(){
	if(mousedown_A == true || mousedown_B == true){
		visiblePoints();
		d3.select("#area_A")
			.attr("fill-opacity", "0");
		d3.select("#area_B")
			.attr("fill-opacity", "0");
	}
	mousedown_A = false;
	mousedown_B = false;
});

$("#map").mousemove(function(){
	if(mousedown_A){
		d3.select("#area_A")
			.attr("cx", event.pageX - sidebar_width)
			.attr("cy", event.pageY)
			.attr("fill-opacity", ".25");
	}else if(mousedown_B){
		d3.select("#area_B")
			.attr("cx", event.pageX - sidebar_width)
			.attr("cy", event.pageY)
			.attr("fill-opacity", ".25");
	}
});

$("#area_A").mousedown(function(){
	mousedown_A = true;
});

$("#area_B").mousedown(function(){
	mousedown_B = true;
});

// CHANGING AREA VIA SLIDER CODE

$(function() {
	var slider_a = $( "#slider_A" ).slider({
		value: 50
	});
});

$(function() {
	var slider_b = $( "#slider_B" ).slider({
		value: 50
	});
});

var slider_A_down = false;
var slider_B_down = false;

$("#area_slider").mousemove(function(){
	if(slider_A_down){
		var radius_a = $( "#slider_A" ).slider( "option", "value" );
		d3.select("#area_A")
			.attr("r", (radius_a/100.0)*area_radius);
	}
});

$("#area_slider").mousemove(function(){
	if(slider_B_down){
		var radius_b = $( "#slider_B" ).slider( "option", "value" );
		d3.select("#area_B")
			.attr("r", (radius_b/100.0)*area_radius);
	}
});

$("#slider_A").mousedown(function(){
	slider_A_down = true;
});

$("#slider_B").mousedown(function(){
	slider_B_down = true;
});

$("#slider_A").mouseup(function(){
	if(slider_A_down == true){
		visiblePoints();
		d3.select("#area_A")
			.attr("fill-opacity", "0");
	}
	slider_A_down = false;
});

$("#slider_B").mouseup(function(){
	if(slider_B_down == true){
		visiblePoints();
		d3.select("#area_B")
			.attr("fill-opacity", "0");
	}
	slider_B_down = false;
});

// AREA INTERSECTION CODE

function visiblePoints(){
	svg.selectAll("circle")
		.attr("visibility", "hidden");
	svg.selectAll("circle")
		.filter(function(d){ 
			return insideIntersection(d)
		})
		.attr("visibility", "visible");
	$("#area_A").attr("visibility", "visible");
	$("#area_B").attr("visibility", "visible");
}

function insideIntersection(d){
	var A_cx = d3.select("#area_A").attr("cx");
	var A_cy = d3.select("#area_A").attr("cy");
	var A_r = d3.select("#area_A").attr("r");

	var B_cx = d3.select("#area_B").attr("cx");
	var B_cy = d3.select("#area_B").attr("cy");
	var B_r = d3.select("#area_B").attr("r");

	var x = projection(d.Location)[0];
	var y = projection(d.Location)[1];

	return insideArea(A_cx, A_cy, A_r, B_cx, B_cy, B_r, x, y);
}

function insideArea(A_cx, A_cy, A_r, B_cx, B_cy, B_r, x, y){
	var A_lhs = Math.pow(x - A_cx,2) + Math.pow(y - A_cy,2);
	var B_lhs = Math.pow(x - B_cx,2) + Math.pow(y - B_cy,2);
	var insideA = (A_lhs < (Math.pow(A_r -2,2))) ? true : false;
	var insideB = (B_lhs < (Math.pow(B_r-2,2))) ? true : false;	
	var intersection = ((insideA == true) && (insideB == true))? true : false;
	return intersection
}

// BEGIN FILTERING FUNCTIONS
//DAY OF THE WEEK
d3.selectAll(".dow").on("change", function(){
	var day = this.value;
	var visibility = this.checked ? "visible" : "hidden";
	svg.selectAll("circle")
		.filter(function(d){ return d.DayOfWeek == day})
		.attr("visibility", visibility);
});

d3.selectAll(".crime-category").on("change", function(){
	var category = this.value;
	var visibility = this.checked ? "visible" : "hidden";
	svg.selectAll("circle")
		.filter(function(d){ return categoryDict[d.Category] == category})
		.attr("visibility", visibility);
});

//INITALIZING COLORS & CATEGORIES
var categories = ["Domestic", "Financial/Fraud", "Non-Violent", "Other", "Property", "Sex-Related", "Substance-Related", "Theft", "Vehicle", "Violent", "Weapons"];

var categoryDict = {};
categoryDict["FAMILY OFFENSES"] = "Domestic";
categoryDict["KIDNAPPING"] = "Domestic";

categoryDict["BAD CHECKS"] = "Financial/Fraud";
categoryDict["BRIBERY"] = "Financial/Fraud";
categoryDict["EMBEZZLEMENT"] = "Financial/Fraud";
categoryDict["EXTORTION"] = "Financial/Fraud";
categoryDict["FORGERY/COUNTERFEITING"] = "Financial/Fraud";
categoryDict["FRAUD"] = "Financial/Fraud";
categoryDict["GAMBLING"] = "Financial/Fraud";

categoryDict["DISORDERLY CONDUCT"] = "Non-Violent";
categoryDict["LOITERING"] = "Non-Violent";
categoryDict["RUNAWAY"] = "Non-Violent";
categoryDict["SUICIDE"] = "Non-Violent";

categoryDict["MISSING PERSON"] = "Other";
categoryDict["SECONDARY CODES"] = "Other";
categoryDict["NON-CRIMINAL"] = "Other";
categoryDict["OTHER OFFENSES"] = "Other";
categoryDict["SUSPICIOUS OCC"] = "Other";
categoryDict["TREA"] = "Other";
categoryDict["WARRANTS"] = "Other";

categoryDict["ARSON"] = "Property";
categoryDict["TRESPASS"] = "Property";
categoryDict["PROPERTY"] = "Property";
categoryDict["VANDALISM"] = "Property";

categoryDict["PORNOGRAPHY/OBSCENE MAT"] = "Sex-Related";
categoryDict["PROSTITUTION"] = "Sex-Related";
categoryDict["SEX OFFENSES, FORCIBLE"] = "Sex-Related";
categoryDict["SEX OFFENSES, NON FORCIBLE"] = "Sex-Related";

categoryDict["DRIVING UNDER THE INFLUENCE"] = "Substance-Related";
categoryDict["DRUG/NARCOTIC"] = "Substance-Related";
categoryDict["DRUNKENNESS"] = "Substance-Related";
categoryDict["LIQUOR LAWS"] = "Substance-Related";

categoryDict["BURGLARY"] = "Theft";
categoryDict["LARCENY/THEFT"] = "Theft";
categoryDict["ROBBERY"] = "Theft";
categoryDict["STOLEN PROPERTY"] = "Theft";

categoryDict["RECOVERED VEHICLE"] = "Vehicle";
categoryDict["VEHICLE THEFT"] = "Vehicle";

categoryDict["ASSAULT"] = "Violent";

categoryDict["WEAPON LAWS"] = "Weapons";

var color = d3.scale.ordinal()
	.domain(categories)
	.range(["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]);

var colorCrimeCategory = function(subcategory){
	cat = categoryDict[subcategory];
	return cat ? color(cat) : "black";
}
for (var i=0; i<categories.length; i++){
	category = categories[i];
	$('#category-selectors').append("<div class='category-wrapper'><label><input type='checkbox' value=" + category+ " class='crime-category' checked>" + category + "</label><div class='color-swatch' style='background-color:"+color(category)+";'</div></div>");
	if((i+1)%2==0){
		$('#category-selectors').append("</br>");
	}
}

