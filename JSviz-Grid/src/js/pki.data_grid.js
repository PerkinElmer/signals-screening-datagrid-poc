
function renderCore(sfdata){
  
      let plotData = sfdata.data.map(function(p){
          return p.items
      })
  
      createPlot(plotData, sfdata);
}
  
function createPlot(plotData, sfdata){

    let divChart = document.getElementById("js_chart");
    divChart.innerHTML = "";

    var options = {
        data: plotData,
        colHeaders: sfdata.columns,
        colWidths: sfdata.columns.map(function(p){return 150}),
        /*
        columns: [
            sfdata.columns.map(function(p){
                return { type: 'text' }
            })
        ]
        */
    }

    $('#js_chart').jexcel(options); 

    //-------------------------------------
    //Update button
    //-------------------------------------
    document.createElement('button');
    const btUpdate = document.createElement('button');
    btUpdate.innerHTML = 'Update';
    btUpdate.onclick = function(){
        let str = sfdata.columns.join(",") + "\n";
        plotData.forEach(function(row){
            str = str + row.join(",") + "\n";
        })
        //console.log(str)

        if (window.Spotfire){
			try {
                let	scriptInfo	= {
                    "ScriptName":"ReplaceTable",
                    "Arguments":{"table": "PlateDesign"}
                };

                window.Spotfire.modify("script", scriptInfo);
			}
			catch (ex) {
				console.error(ex);
			}
		}
    };

    const divBt = document.createElement("div");
    divBt.appendChild(btUpdate);

    document.getElementById("js_chart").appendChild(divBt); 
}