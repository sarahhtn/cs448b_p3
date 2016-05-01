
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
var svg = d3.select("body").append("svg")
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
		.attr("fill", function (d) {return colorCrimeCategory(d.Category)});

});



// var circleAttributes = circles
//                        .attr("cx", function (d) { return d.x_axis; })
//                        .attr("cy", function (d) { return d.y_axis; })
//                        .attr("r", function (d) { return d.radius; })
//                        .style("fill", function(d) { return d.color; });




// BEGIN FILTERING FUNCTIONS
//DAY OF THE WEEK
d3.selectAll(".dow").on("change", function(){
	var day = this.value;
	var visibility = this.checked ? "visible" : "hidden";
	svg.selectAll("circle")
		.filter(function(d){ return d.DayOfWeek == day})
		.attr("visibility", visibility);
});

//INITALIZING COLORS & CATEGORIES
var color = d3.scale.ordinal()
	.domain(["Domestic", "Financial/Fraud", "Non-Violent", "Other", "Property", "Sex-Related", "Substance-Related", "Theft", "Vehicle", "Violent", "Weapons"])
	.range(["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]);
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

var colorSet = new Set();
var colorCrimeCategory = function(subcategory){
	cat = categoryDict[subcategory];
	if(!cat){
		console.log(subcategory + " --> " + cat + ": " + color(cat));	
	}
	colorSet.add(color(cat))
	return cat ? color(cat) : "black";
}

console.log(colorSet.values());

