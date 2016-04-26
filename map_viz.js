
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
		.attr("fill", "red");

});

