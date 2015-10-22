$.get("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", function(data) { 
	renderGraph();
	var data = {numberOfQuakes: data.features.length, earthquakes: data.features}; 

	var content = document.getElementById('content');

	var source   = $("#quake_template").html();
	var template = Handlebars.compile(source);
	content.innerHTML = template(data);
	// var html    = template(context);
		
	function renderGraph() { 
		$(document).ready(function() { 
			svg(); 
		});
	}

	function svg() { 

		var width = 1200, 
			height = 500;

		var radius = d3.scale.linear() 
			.domain([0, 10])
			.range([0, 75]); 

		var projection = d3.geo.naturalEarth()
			.scale(167)
			.translate([width/2, height/2])
			.precision(.1); 

		var path = d3.geo.path()
			.projection(projection); 

		var graticule = d3.geo.graticule();

		var svg = d3.select("#graph").append("svg")
			.attr("width", width)
			.attr("height", height); 

		var quake_tip = d3.tip()
			.attr("class", "d3-tip")
			.offset([-10, 0])
			.html(function(d) { 
				var str = ""; 

				str += ("<span class='location'>" + "Location: " + d.properties.place + "</span><br>"); 
				str += ("<span class='magnitude'>" + "Magnitdue: " + d.properties.mag + "</span><br>");
				str += ("<span class='longitude'>" + "Longitude: " + d.geometry.coordinates[0] + "</span><br>"); 
				str += ("<span class='latitude'>" + "Latitude: " + d.geometry.coordinates[0] + "</span><br>");  

				return str; 
			}); 

		svg.call(quake_tip);


		svg.append("defs").append("path")
		    .datum({type: "Sphere"})
		    .attr("id", "sphere")
		    .attr("d", path);

		svg.append("use")
		    .attr("class", "stroke")
		    .attr("xlink:href", "#sphere");

		svg.append("use")
		    .attr("class", "fill")
		    .attr("xlink:href", "#sphere");

		svg.append("path")
		    .datum(graticule.outline)
		    .attr("class", "water")
		    .attr("d", path);

		svg.append("path")
		    .datum(graticule)
		    .attr("class", "graticule")
		    .attr("d", path);

		d3.json("world.json", function(error, world) {
			  if (error) throw error;

			  svg.insert("path", ".graticule")
			      .datum(topojson.feature(world, world.objects.land))
			      .attr("class", "land")
			      .attr("d", path);

			  svg.insert("path", ".graticule")
			      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			      .attr("class", "boundary")
			      .attr("d", path);
		});

		d3.json("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson", function(data) { 
			console.log(data.features); 

			dataset = data.features; 
			console.log(dataset.length); 

			var quakes = svg.selectAll(".quake")
				.data(dataset)
				.enter().append("g")
				.attr("class", "quake")
				.attr("transform", function(d) { 
					return "translate(" + projection(d.geometry.coordinates)[0] + ", " + projection(d.geometry.coordinates)[1] + ")";
				})
				.on("mouseover", function(d) { 
					quake_tip.show(d); 
				})
				.on("mouseout", quake_tip.hide); 

			quakes.append("circle")
				.attr("class", "center")
				.attr("r", 1.5)
				.style("fill", "rgb(222, 45, 38)"); 

			setInterval(function() { 

				quakes.append("circle")
					.attr("class", "quakeRange")
					.attr("r", 0)
					.style("stroke", "rgb(222, 34, 38)")
					.style("stroke-width", 1)
					.transition() 
					.ease("linear")
					.duration(function(d) { return 125 * radius(d.properties.mag); })
					.attr("r", function(d) { return radius(d.properties.mag); })
					.style("style-opacity", 0)
					.style("stroke-width", 0)
					.remove(); 
			}, 1000);

		});

		d3.select(self.frameElement).style("height", height + "px");
	}	
});