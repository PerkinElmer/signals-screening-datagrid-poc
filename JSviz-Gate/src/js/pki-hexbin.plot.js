
function renderCore(sfdata) {
	let plotData = sfdata.data.map(function (p){
        if (p.items[0] !== "" && p.items[1] !== "")
            return {x: parseInt(p.items[0]), y: parseInt(p.items[1])};
    });

    createPlot(plotData, sfdata.config);
}

let selGatingShape = 2;
function createPlot(plotData, config) {
    

	// ******************************************************
    // Clear
    // ******************************************************
    let div = document.getElementById( "div_plot" );
    div.innerHTML = "";
    d3.selectAll("svg").selectAll("*").remove();
    
    
    //===============================================================================================
    menu("#div_menu");
    //===============================================================================================

    // ******************************************************
    // Settings
    // ******************************************************
    let currentShape;
    let inShape = false;

    //let lasso_sel = config.lasso;
    let lasso_sel = "";
    //let lasso_sel = "M 420 464 L 422 459 L 423 456 L 423 454 L 425 452 L 426 450 L 428 448 L 431 446 L 434 445 L 435 444 L 436 444 L 436 443 L 438 443 L 439 443 L 441 443 L 443 445 L 446 449 L 447 451 L 448 453 L 449 454 L 449 455 L 450 457 L 451 460 L 451 462 L 451 463 L 451 465 L 451 466 L 451 467 L 450 467 L 449 467 L 447 467 L 445 467 L 443 468 L 442 468 L 440 468 L 439 468 L 437 469 L 436 469 L 435 469 L 431 469 L 430 469 L 428 469 L 427 469 L 425 469 L 423 468 L 422 468 L 421 466";
	
    let margin = {top: 10, right: 0, bottom: 30, left: 50},
        width = window.innerWidth,
        height = window.innerHeight;

    let x = d3.scaleLinear()
        .domain([d3.min(plotData, function(d){ return d.x; }) / 1.2, d3.max(plotData, function(d){ return d.x; }) * 1.2])
        .range([ 0, width ]);

    let y = d3.scaleLinear()
        .domain([d3.min(plotData, function(d){ return d.y; }) / 1.2, d3.max(plotData, function(d){ return d.y; }) * 1.2])
        .range([ height, 0]);

    const dataScaled = [];
    plotData.forEach(point => {
        dataScaled.push({x: x(point.x), y: y(point.y), id: point.id});
    });

    //let radio = +d3.select("#radioSlider").property("value");
    let radio = 4;
    //console.log("radio: ", radio);

    let hexbin = d3.hexbin()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); })
        .radius(radio * width / height )
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    
	let bins = hexbin(plotData);
    //console.log(bins);

    let color = d3.scaleSequential(d3.interpolateBuPu)
        .domain([0, d3.max(bins, d => d.length) / 5])
    
    // ******************************************************
    // svgPlot
    // ******************************************************
    var svgPlot = d3.select("#js_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //.call(responsivefy)
        .on("mousedown", mousedown)
        .on("mouseup", mouseup)
        .append("g")
        .attr("id", "g_shape")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");
        
    svgPlot.append("g").attr("transform", "translate(" + margin.left + "," + height + ")").call(d3.axisBottom(x));
    
    svgPlot.append("g")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .call(d3.axisLeft(y));

    let lasso_points = svgPlot.append('g')
        .attr("transform", "translate(" + (20 + radio + margin.left) + ", "  + (- radio - margin.top) + ")") //TODO
        .attr("id", "g_plot")
        .selectAll("path")
        .data(bins)
        .enter()
        .append("path")
            .attr("d", function(d) { return "M" + d.x + "," + d.y + hexbin.hexagon(); })
            .attr("fill", d => color(d.length));   

    recover_selection(lasso_sel);

    // ******************************************************
    // Lasso functions
    // ******************************************************
    //Function to recover lasso selection delete after tibco marking.
    function recover_selection (lasso_sel){
        if (lasso_sel && lasso_sel != ""){
            d3.select("#g_plot")
            .append("path")
                .attr("d", lasso_sel + "Z")
                .attr("fill", "red")
                .attr("stroke", "black")
                .attr("stroke-width", "1")
                .attr("r",5);
        }
    }

    let lasso_start = function() {
        
        lasso.items()
            .classed("not_possible",true)
            .classed("selected",false);
            
    };

    let lasso_draw = function() {
        // Style the possible dots
        lasso.possibleItems()
            .classed("not_possible",false)
            .classed("possible",true);

        // Style the not possible dot
        lasso.notPossibleItems()
            .classed("not_possible",true)
            .classed("possible",false);
    };
    
    let lasso_end = function() {
        // Reset the color of all dots
        lasso.items()
            .classed("not_possible",false)
            .classed("possible",false);

        // Style the selected dots
        lasso.selectedItems()
            .classed("selected",true)
            .attr("r",5);

        // Reset the style of the not selected dots
        lasso.notSelectedItems()
            .attr("r", 4);;

        //******************************************
        // Get selected points
        //******************************************
        let path_obj = d3.select(".drawn")
        let path = path_obj._groups[0][0];
        const strPath = d3.select(path).attr("d").toString();
        let polygon = getPolyFromPath(path, 50);
        
        let polygonAdjusted = [];
        polygon.forEach(p => {
            polygonAdjusted.push([ 
                p[0] - (20 + radio + margin.left),
                p[1] + (radio + margin.top)
            ]);
        });

		let selIndex = getSelectedIndex(polygonAdjusted, dataScaled);
		let selData = getMarking(selIndex, "Replace")
		
		if (window.Spotfire){
			try {
				window.Spotfire.modify("mark", selData);

                var docPropLassoPath = {"PropertyName":	"lasso", "PropertyValue": strPath};
                if (docPropLassoPath)
				    window.Spotfire.modify("documentproperty", docPropLassoPath); 
 
			}
			catch (ex) {
				console.error(ex);
			}
		}
    };

    // Set lasso to points
    let lasso = d3.lasso()
        .closePathSelect(true)
        .closePathDistance(75)
        .items(lasso_points)
        .targetArea(svgPlot)
        //.targetArea(d3.selectAll("#rect_area"))
        .hoverSelect(true)
        .on("start",lasso_start)
        .on("draw",lasso_draw)
        .on("end",lasso_end);

    
    //svgPlot.call(lasso);

    // ******************************************************
    // Shape functions
    // ******************************************************
    function mousedown() {
        clear();
        
        console.log("selGatingShape: ", selGatingShape);
        if (selGatingShape === 4){
            svgPlot.call(lasso);
            currentShape = d3.select(".drawn")
        }

        let point = d3.mouse(this);
        
        if (!inShape){
            d3.select("#g_shape").append("circle")
            .attr("id", "initPoint")
            .attr("cx", point[0])
            .attr("cy", point[1])
            .attr("r", 3)
            .attr("fill", "red")
        }
        

        if (selGatingShape === 1){
        //d3.select("#g_shape").selectAll("ellipse.selGatingShape").remove()
        currentShape = d3.select("#g_shape").append("ellipse")
                .attr("cx", point[0])
                .attr("cy", point[1])
                .attr("rx", 0)
                .attr("ry", 0)
                .attr("class", "selGatingShape")
                .on("mouseover", function() {
                    inShape = true;
                    selGatingShape = 1;
                    //d3.select(this).style("cursor", "move");
                    d3.select(this).style("cursor", "pointer"); 
                })
        }
        
        if (selGatingShape === 2){
            //d3.select("#g_shape").selectAll("rect.selGatingShape").remove()
            currentShape = d3.select("#g_shape").append("rect")
                .attr("x", point[0])
                .attr("y", point[1])
                .attr("height", 0)
                .attr("width", 0)
                .attr("class", "selGatingShape")
                .on("mouseover", function() {
                    inShape = true;
                    selGatingShape = 2;
                    //d3.select(this).style("cursor", "move");
                    d3.select(this).style("cursor", "pointer"); 
                })
        }

        if (currentShape){
            currentShape.on("mouseout", function() {
                //console.log("out");
                inShape = false;
                d3.select(this).style("cursor", "default"); 
            })
            .call(d3.drag() 
                .on("start", dragstarted)
                .on("drag", dragged)
                //.on("end", dragended)
                );
        }

        if (!inShape)
            svgPlot.on("mousemove", mousemove);

        
    }

    function mousemove() {
        let point = d3.mouse(this);

        if (selGatingShape === 1){
            currentShape
                .attr("rx", Math.max(0, point[0] - +currentShape.attr("cx")))
                .attr("ry", Math.max(0, point[1] - +currentShape.attr("cy")));
        }

        if (selGatingShape === 2){
            currentShape
                .attr("width", Math.max(0, point[0] - +currentShape.attr("x")))
                .attr("height", Math.max(0, point[1] - +currentShape.attr("y")))
        }
        
    }

    function mouseup() {
        d3.select("#initPoint").remove();
        svgPlot.on("mousemove", null);

    }

    function dragstarted(d) {
        d3.select(this).attr("stroke", "black");

    }
    
    function dragged(d) {
        let point = d3.mouse(this);
        
        if (selGatingShape === 1)
            d3.select(this).attr("cx", point[0]).attr("cy", point[1]);
    
        if (selGatingShape === 2)
            d3.select(this).attr("x", point[0]).attr("y", point[1]);
       
        
    }
    function dragended(d) {
        d3.select(this).attr("stroke", "red");
    }
    
    function clear(){
        d3.select("#g_shape").selectAll("ellipse.selGatingShape").remove();
        d3.select("#g_shape").selectAll("rect.selGatingShape").remove();
        d3.select("#g_shape").selectAll(".circle_resize").remove();
        d3.select("#g_shape").selectAll(".possible").remove();
        
    }

}

function getMarking(idx, mode){

	let markData = {};

	markData.markMode = mode;
	markData.indexSet = idx;
	
	return markData;
}

function getSelectedIndex(polygon, data){
	
	let selIndex = [];
	let cont = 0;
    if (polygon.length > 0) {
        data.forEach(point => {
			cont++
            let isIn = d3.polygonContains(polygon, [point.x,point.y]);
            if (isIn){
				selIndex.push(cont);
			}
                
        });
    }
	
    //console.log("Selected points: ", selIndex);
	return selIndex;
}

function getSelectedPoints(polygon, data){
	
    let inPoints = [];
    if (polygon.length > 0) {
        data.forEach(point => {
			cont++
            let isIn = d3.polygonContains(polygon, [point.x,point.y]);
            if (isIn){
				inPoints.push(point);
			}
                
        });
    }
	
    //console.log("Selected points: ", inPoints.length);
	return inPoints;
}

function getPolyFromPath(path, n_points){
    let polygons = [];
    let len = path.getTotalLength();
    
    if (len > 0) {
        for (var i=0; i <= n_points-1; i++) {
            let point = path.getPointAtLength(i * len / (n_points -1));
            polygons.push([point.x, point.y]);
        }
    }

    return polygons;
}



