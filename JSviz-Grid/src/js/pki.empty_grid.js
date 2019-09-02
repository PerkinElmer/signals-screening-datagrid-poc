
function renderCore(sfdata){
    
    let nRows = +sfdata.config.rows;
    let nCols = +sfdata.config.columns;

    let plotData = new Array(nRows);

    for (var i = 0; i < plotData.length; i++)
        plotData[i] = new Array(nCols);
    
    createPlot(plotData, sfdata);
}

function createPlot(plotData){

    let div = document.getElementById("js_chart");
    div.innerHTML = "";

    var options = {
        data: plotData,
        colWidths: Array(plotData[1].length).fill(100),
    }

    $('#js_chart').jexcel(options); 

}