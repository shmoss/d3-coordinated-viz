//begin script when window loads
window.onload = setMap();



//set up the map
function setMap(){
    var width = 960, //dimensions
        height = 460; //dimensions

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Chicago, Illinois
    var projection = d3.geo.albers()
        .center([0, 41.88]) //set coordinates
        //set rotation 
        .rotate([87.623, 0, 0])
        //these are our standard parallels
        .parallels([40, 42])
        //let's make sure we can see Chicago
        .scale(50000)
        .translate([width / 2, height / 2]);
        
   //this is our path generator function
   var path = d3.geo.path()
       .projection(projection);
    //queue.js for data loading
    var q = d3_queue.queue();
    q		
		//get data from these files
		.defer(d3.csv, "data/crimeTotalsFinal.csv") //load attributes from csv
		.defer(d3.json, "data/Illinois_WGS_1984.topojson") //load background spatial data
		.defer(d3.json, "data/commAreas_WGS_1984.topojson") //load choropleth spatial data
		.await(callback);

    //once data loaded, callback function
    //takes 4 parameters (including the above three data sources) 
	function callback(error, csvData, background, communities){
		
        console.log(csvData);
        console.log(background);
        console.log(communities);
        
        //create graticule
        var graticule = d3.geo.graticule()
            .step([0.5, 0.5]); //place graticule lines every 5 degrees of longitude and latitude
        
        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            //assign class for styling
            .attr("class", "gratBackground") 
            //project graticule
            .attr("d", path) 
        
        //create graticule lines
        //select graticule elements that will be created
        var gratLines = map.selectAll(".gratLines") 
            .data(graticule.lines()) //bind graticule lines to each element to be created
            //create an element for each datum 
            .enter() 
            //append each element to the svg as a path element
            .append("path") 
            //assign class for styling
            .attr("class", "gratLines") 
            //project graticule lines
            .attr("d", path); 
		
	   
       var backgroundState = topojson.feature(background, background.objects.Illinois_WGS1984),  //translate community area and Illinois TopoJSON
		   communityAreas = topojson.feature(communities, communities.objects.commAreas_WGS_1984).features;                       
        //add Illinois to map
        var state = map.append("path")
            .datum(backgroundState)
            .attr("class", "state")
            .attr("d", path);
     
        //add community regions to map
        var community = map.selectAll(".regions")
            .data(communityAreas)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "community " + d.community;
            })
            .attr("d", path);
    };
};