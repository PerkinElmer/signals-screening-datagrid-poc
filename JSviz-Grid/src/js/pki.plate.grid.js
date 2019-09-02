
let sfdata = "";
renderCore(sfdata);



function renderCore(sfdata){
	const fixed = false;
    //let plotData = getPlotData(+sfdata.config.rows, +sfdata.config.columns, sfdata.config.fixed);
    let plotData = getPlotData(9, 4, fixed);

	createPlot(plotData, fixed);
	
}

function getPlotData(nRow, nCols, fixed){
    //console.log("fixeed: ", fixed)
    const value = fixed === true ? "Sample" : "";
    //const value ="Sample";
    let plotData = new Array(nRow);
    for (var i = 0; i < plotData.length; i++)
        plotData[i] = Array(nCols).fill(value)

        return plotData;
}


function createPlot(plotData, fixed){

    let div = document.getElementById("js_chart");
    div.innerHTML = "";

    //console.log("plotDataaa: " , plotData);

    const values = ["Sample", "Negative", "Positive"];
    let cols = plotData[1].map(function(p,i){
        const colType = fixed ? "dropdown" : "text";
        return {type: colType, title: (i+1).toString(), width:120, source: values};
    });
    
    const nCells = plotData.length * plotData[1].length;
    const options = {
        data: plotData,
        columns: cols,
        //colHeaders: plotData[1].map(function(p,i){return (i + 1).toString()}),
        tableOverflow: (nCells > 9999),
        lazyLoading:(nCells > 9999),
        //allowInsertRow:  false,
        //allowInsertColumn: false,
        //allowManualInsertColumn:false,
        //allowDeleteRow:false,
       // allowDeleteColumn:false,
       // allowRenameColumn:false,
        allowSpreadColumns: true,
        allowSpreadRows: true,
        //csvDelimiter:'\t',
    };
   
    let grid = jexcel(document.getElementById("js_chart"), options);
    //setColor();
    console.log("defaults: ", grid)
    /****************************************************************** */
    /*
    function setColor(){
        console.clear();
        let mapColors = new Map();
        mapColors.set("", "white");
        mapColors.set("Sample", "red");
        mapColors.set("Negative", "orange");
        mapColors.set("Positive", "green");
            
        const lenCols = grid.colgroup.length;
        const lenRows = grid.rows.length;
        let colNames = grid.colgroup.map(function(p,i){return jexcel.getColumnName(i)});
        for (let i = 1; i < lenRows+1; i++){
            for (let j = 0; j < lenCols; j++){
                let cell = colNames[j] + i.toString();
                let val = grid.getValue(cell);
                
                let color = mapColors.get(val);
                console.log("cell: ", cell, val, color);
                grid.setStyle(cell, 'background-color', color)

            }
        }
    }
    */
    //****************************************************************** */
    //Add button
	const btApply = document.getElementById("pki.bt.apply")
	btApply.onclick = function(){
        // let ss = document.execCommand('paste')
        // console.log(ss);
        //setColor();
    }
    const btSpread = document.getElementById("pki.bt.spread")
	btSpread.onclick = function(){
        console.clear();

        let sel = getGridSelection(grid);
        /*
        let selRowCols = sel.data;
        //console.log("selRowCols: ", selRowCols);
        for (let i = 0; i < selRowCols.length; i++){
            for (let j = 0; j < selRowCols[i].length; j++){
               //console.log("val: ", selRowCols[i][j]);
            }
            //console.log("------------------------------");
        }
        */
      
        let rowCounter = 0;
        const lenRows = grid.rows.length;
        for (let i = 0; i < lenRows; i++){
            if (rowCounter >= sel.totalRows)
                rowCounter = 0;

            for (let j = sel.firstCol; j < sel.lastCol+1; j++){
                const strCol = jexcel.getColumnNameFromId([j,i]);
                const val = sel.data[rowCounter][j - sel.firstCol];
                grid.setValue(strCol, val);
            }
            rowCounter ++;
        }
        
        // let strCol = jexcel.getColumnNameFromId([iCol, +strRow - 1]);
        // obj.setValue(strCol, strValue);
        console.log("getSelectedRows: ", sel.totalRows);
        console.log("getSelectedColumns: ",sel.totalCols);  
       
    }

}

function getGridSelection(grid){
    const firstSelRow = grid.selectedContainer[1];
    const lastSelRow = grid.selectedContainer[3];
    const firstSelCol = grid.selectedContainer[0];
    const lastSelCol = grid.selectedContainer[2];

    let selRowCols = [];
    for (let i = firstSelRow; i < lastSelRow+1; i++){
        let selCol = [];
        for (let j = firstSelCol; j < lastSelCol+1; j++){
            selCol.push(grid.getValueFromCoords(j,i));
        }
        selRowCols.push(selCol);
    }

    return {
        data: selRowCols,
        firstRow: firstSelRow,
        lastRow: lastSelRow,
        firstCol: firstSelCol,
        lastCol: lastSelCol,
        totalRows: (lastSelRow - firstSelRow) === 0 ? 1 : (lastSelRow - firstSelRow) + 1,
        totalCols: (lastSelCol - firstSelCol) === 0 ? 1 : (lastSelCol - firstSelCol)  + 1,
    };
}


function changeRowCols(){
    let r = document.getElementById('txt_rows').value;
    let c = document.getElementById('txt_cols').value;
    let fixed = document.getElementById('chk_fixed').checked;
    //console.log("rrr: ", r,c, fixed)
    const plotData = getPlotData(+r, +c, fixed);
    createPlot(plotData, fixed);
   
}



function changeCols(val){
    console.log("changeCols: ", val)
}

function apply(){
    console.log("applyyy")
}

function clear(){
    console.log("clear")
}

function getColor() {
    /*
    let getRandom = function () { 
        return Math.floor(Math.random() * 256) 
    };
    return "rgb(" + getRandom() + "," + getRandom() + "," + getRandom() + ", 0.4)";
    */

   const color = randomColor({
        luminosity: 'light',
        hue: 'random',
        alpha: 0.5
    });
 
   //console.log (color)
   return color; 

  };
/*
function save(plotData, sfdata){
    alert("holaaa");
}

modal = jSuites.modal(document.getElementById('js_modal'), {
    width:'400px',
    height:'280px',
    closed:true,
    onclose:function() {
        let r = document.getElementById('txt_rows').value;
        let c = document.getElementById('txt_cols').value;
        let fixed = document.getElementById('chk_fixed').value;
        
        const plotData = getPlotData(+r, +c, fixed);
        createPlot(plotData, sfdata);
    },
    onopen:function() {
        let data = grid.getData();
        document.getElementById('txt_rows').value = data.length;
        document.getElementById('txt_cols').value = data[1].length;
    },
});
*/
 //console.log(table.getData());

