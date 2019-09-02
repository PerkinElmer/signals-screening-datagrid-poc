function CreateSubPaths(densityData, div_plot, svg){
    d3.selectAll("#" + div_plot).remove();

    //Create path
    svg.append('g')
        .attr("id", div_plot)
        .selectAll("path")
        .data(densityData)
        .enter().append("path")
            .attr("d", d3.geoPath())


    return splitPaths();
}

function splitPaths(){
   
    let data = [];
    d3.selectAll('path').each(function(d) {
        const path = d3.select(this)._groups[0][0];
        const strPath = d3.select(path).attr("d").toString();
        strPath.split('Z').forEach(subPaths => {
            data.push(subPaths + 'Z')
        });
    });

    let dataPaths = [];
    for (let i = 2; i < data.length; i++) 
        dataPaths.push(data[i]);

    return dataPaths;
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

function getPolyFromPath(path, n_points){
    const len = path.getTotalLength();
    let polygons = [];

    for (var i=0; i <= n_points-1; i++) {
        let point = path.getPointAtLength(i * len / (n_points -1));
        polygons.push([point.x, point.y]);
    }

    return polygons;
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