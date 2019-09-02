

function renderCore(sfdata) {
    
    let plotData = sfdata.data.map(function (p){
        if (p.items[0] !== "" && p.items[1] !== "")
            return {x: parseInt(p.items[0]), y: parseInt(p.items[1])};
    });

    createPlot(plotData);
}

function responsivefy(svg) {
    let container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);

    function resize() {
        let targetWidth = parseInt(container.style("width"));
            svg.attr("width", targetWidth);
            svg.attr("height", Math.round(targetWidth / aspect));
    }
}

function createPlot(plotData) {
    // Clear
    let div = document.getElementById( "js_chart" );
    div.innerHTML = "";
    d3.selectAll("svg").selectAll("*").remove();

    // Settings
    var margin = {top: 10, right: 0, bottom: 30, left: 50},
        width = window.innerWidth,
        height = window.innerHeight;

    let x = d3.scaleLinear()
        .domain([d3.min(plotData, function(d){ return d.x; }) / 1.2, d3.max(plotData, function(d){ return d.x; }) * 1.2])
        .range([ 0, width ]);

    let y = d3.scaleLinear()
        .domain([d3.min(plotData, function(d){ return d.y; }) / 1.2, d3.max(plotData, function(d){ return d.y; }) * 1.2])
        .range([ height, 0]);

    // SVG
    var svg = d3.select("#js_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(responsivefy)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    svg.append("g").attr("transform", "translate(" + margin.left + "," + height + ")").call(d3.axisBottom(x));
    
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .call(d3.axisLeft(y));

    const color = d3.scaleSequential(d3.interpolateBuPu).domain([0, 1.5]); // Points per square pixel.
    
    let densityData = d3.contourDensity()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); })
        .size([width, height])
        .bandwidth(15)
        (plotData);
   

    let g_plot = svg.append("g")
        .attr("transform", "translate(" + (16 * 2.1 +  margin.left) + ", " + 16 * -2.1 + ")") 

    let path = g_plot.selectAll("path").data(densityData);

    // Enter paths
    path.enter().append("path")
        .attr("d", d3.geoPath())
        .attr("fill", function(d) { return color(d.value); })

    // Update paths
    path.attr("d", d3.geoPath())
        .attr("fill", function(d) { return color(d.value); })

    // Remove paths not mapped with data
    path.exit().remove();
            
}

