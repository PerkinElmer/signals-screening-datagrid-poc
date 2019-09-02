
function renderCore(sfdata) {
    
    let plotData = sfdata.data.map(function (p){
        if (p.items[0] !== "" && p.items[1] !== "")
            return {x: parseInt(p.items[0]), y: parseInt(p.items[1])};
    });

    createPlot(plotData);
}

function createPlot(plotData) {

	// ******************************************************
    // Clear
    // ******************************************************
    let div = document.getElementById( "js_chart" );
    div.innerHTML = "";
    d3.selectAll("svg").selectAll("*").remove();
	
    //createHTML()

    // ******************************************************
    // Settings
    // ******************************************************
    let margin = {top: 10, right: 0, bottom: 30, left: 50},
        width = window.innerWidth,
        height = window.innerHeight;

    let x = d3.scaleLinear()
        .domain([d3.min(plotData, function(d){ return d.x; }) / 1.2, d3.max(plotData, function(d){ return d.x; }) * 1.2])
        .range([ 0, width ]);

    let y = d3.scaleLinear()
        .domain([d3.min(plotData, function(d){ return d.y; }) / 1.2, d3.max(plotData, function(d){ return d.y; }) * 1.2])
        .range([ height, 0]);

    let densityData = d3.contourDensity()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); })
        .size([width, height])
        .bandwidth(15)
        (plotData);


    // ******************************************************
    // svg
    // ******************************************************
    
    var svg = d3.select("#js_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    svg.append("g").attr("transform", "translate(" + margin.left + "," + height + ")").call(d3.axisBottom(x));
    
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .call(d3.axisLeft(y));

    d3.selectAll("#g_plot").selectAll('path').remove();

    const color = d3.scaleSequential(d3.interpolateBuPu).domain([0, 1.5]); 

    svg.append('g')
        .attr("transform", "translate(" + (16 * 2.1 +  margin.left) + ", " + 16 * -2.1 + ")") //TODO
        .attr("id", "g_plot")
        .selectAll("path")
        .data(densityData)
        .enter()
            .append("path")
            .attr("class", "densPathInit")
            .attr("fill", function(d) { return color(d.value); })
            .attr("d", d3.geoPath());

	
    createPolygonsFromPath();
    
    // ******************************************************
    // Internal functions
    // ******************************************************
    function createDensityPath(path){
        const color = d3.scaleSequential(d3.interpolateBuPu).domain([0, 1.5]); 
        d3.select('#g_plot').selectAll("path").attr("fill", function(d) { return color(d.value); });
    }

    function createPolygonsFromPath(){
        let dataPaths = [];
        d3.selectAll('path').each(function(d) {
            const path = d3.select(this)._groups[0][0];
            const strPath = d3.select(path).attr("d").toString();
            strPath.split('Z').forEach(subPaths => {
                dataPaths.push(subPaths + 'Z')
            });
        });

        let dataPathsCorrected = [];
        for (let i = 2; i < dataPaths.length; i++) {
            if (dataPaths[i] !== 'Z')
                dataPathsCorrected.push(dataPaths[i]);
        }
        
        const dataScaled = [];
        plotData.forEach(point => {
            dataScaled.push({x: x(point.x), y: y(point.y), id: point.id});
        });
        
        svg.append('g')
            .attr("transform", "translate(" + (16 * 2.1 +  margin.left) + ", " + 16 * -2.1 + ")") //TODO
            .attr("id", "g_plot")
            .selectAll("path")
            .data(dataPathsCorrected)
            .enter().append("path")
                .attr("class", "densPathTemp")
                .attr("d",function(d) { 
                    return d
                }).each(function (d, i) {
                    if (d.toString() != "Z")
                    {
                        let polygons = getPolyFromPath(this, 100);

                        d3.select("#g_plot")
                        .append("polygon")
                            .attr("points", polygons)
                            .attr("class", "densPath")
                            .on("click", function() { 
                                d3.selectAll("polygon").attr("class", "densPath");
                                d3.select(this).attr("class", "densPathSel");
                                //isInPolygon(this, dataScaled);
								getMarking(this, dataScaled);
                            });
                    }
                });
                
        d3.selectAll("#g_plot").selectAll('.densPathTemp').remove();
        //d3.selectAll("#g_plot").selectAll('.densPath').remove();
        //d3.selectAll("#g_plot").selectAll('.densPathInit').remove();
    }
	
	function getMarking(polygon, data){

		let selData = {};
		selData.markMode = "Replace";
		selData.indexSet = getSelectedIndex(polygon, data);
		
		if (window.Spotfire != null){
			const jsonArgs = JSON.stringify(selData);
			try {
				window.Spotfire.modify("mark", selData);
				console.log("selData: ", selData);
			}
			catch (ex) {
				console.error(ex);
			}
		}
		
	}
	
	function getSelectedIndex(polygon, data){

        polyPoints = getPointFromPolygon(polygon);
        let selIndex = [];
		let cont = 0;
        data.forEach(point => {
			cont++
            let isIn = d3.polygonContains(polyPoints, [point.x,point.y]);
            if (isIn){
				selIndex.push(cont);
			}
        });
        console.log("Selected pointss: ", selIndex.length);
		return selIndex;
	}


    function getPolyFromPath(path, n_points){

        const lenTot = path.getTotalLength();
        let polygons = [];

        for (var i=0; i <= n_points-1; i++) {
            let point = path.getPointAtLength(i * lenTot / (n_points -1));
            polygons.push([point.x, point.y]);
        }

        return polygons;
    }

    function isInPolygon(polygon, data){
        console.clear();
        polyPoints = getPointFromPolygon(polygon);
        
        let inPoints = [];
        data.forEach(point => {
            let isIn = d3.polygonContains(polyPoints, [point.x,point.y]);
            if (isIn)
                inPoints.push(point);
        });
        console.log("Selected points: ", inPoints.length);
    }

    function getPointFromPolygon(polygon){
        const polyPoints = [];
        const len = polygon.points.length;
        for (var i=0; i <= len-1; i++) {
            polyPoints.push([
                polygon.points[i].x, 
                polygon.points[i].y
            ]);
        }

        return polyPoints;
    }

    /*
    d3.select("#checkView").on("change", function(d){
        createPlot(plotData);
        
    })
    */
}
/*
function createHTML(){
    // Create HTML controls
    const div_plot = document.getElementById("js_chart");
    var chkViewContour = document.createElement("INPUT");
    chkViewContour.setAttribute("type", "checkbox");
    chkViewContour.setAttribute("id", "checkView");
    chkViewContour.setAttribute("value", "0");
    div_plot.appendChild(chkViewContour);

    const lblTitle = document.createElement("LABEL");
    lblTitle.innerHTML = "View contour";
    div_plot.appendChild(lblTitle);
}
*/