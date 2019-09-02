function menu(div){
    let margin = {top: 10, right: 0, bottom: 30, left: 50},
    width = window.innerWidth;

    let svgMenu = d3.select(div)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 50)
        .append("g")
        //.attr("transform","translate(" + margin.left + "," + margin.top + ")");
    
    let allButtons= svgMenu.append("g")
        .attr("id","allButtons") 
        .attr("transform", "translate(" + margin.left + ", 0)")
        
    let imageData = [
        {text: "circle", value: 1, url: "http://localhost:8080/src/img/circle.svg"},
        {text: "cross", value: 3, url: "http://localhost:8080/src/img/cross.svg"},
        {text: "lasso", value: 4, url: "http://localhost:8080/src/img/laso.svg"},
        {text: "square", value: 2, url: "http://localhost:8080/src/img/square.svg"},
        {text: "rotate", value: 5, url: "http://localhost:8080/src/img/rotate_right.svg"},
        {text: "rotate", value: 6, url: "http://localhost:8080/src/img/rotate_left.svg"}
    ]
        
    const defaultColor= "#7777BB", hoverColor= "#0000ff", pressedColor= "#000077";

    let buttonGroups= allButtons.selectAll("g.button")
        .data(imageData)
        .enter()
        .append("g")
        .style("cursor","pointer")
        .on("click",function(d,i) {
            
            d3.select(this.parentNode).selectAll("rect")
                .attr("fill",defaultColor)

            d3.select(this).select("rect")
                .attr("fill",pressedColor)
            //console.log("value: ", d.value);
            if (+d.value === 5 || +d.value === 6){
               // let dir = +d.value === 5 ? '-' : '+';
                let shape = d3.select("#g_shape").selectAll(".selGatingShape");

                if (shape){
                    let transform =  shape.attr("transform");
                    let x = shape.attr("cx");
                    let y = shape.attr("cy");
                    if (!x){
                        x = +shape.attr("x") + (+shape.attr("width")/2);
                        y = +shape.attr("y") + (+shape.attr("height")/2);
                    }
                    
                    if (transform){
                        const regExp =  /\d+/;
                        let matches = regExp.exec(transform);
                        let currentAngle = +matches[0];
                        let angle = +d.value === 5 ? currentAngle + 10 : currentAngle - 10;
                        //console.log(currentAngle, angle);
                        shape.attr("transform", "rotate(" + angle + "," + x + "," + y + ")")
                    }
                    else{
                        let angle = +d.value === 5 ? 10 : -10;
                        shape.attr("transform", "rotate(" + angle + "," + x + "," + y + ")")
                    }
                }
                
                
                
            }
            // else if (+d.value === 4){
                
            //     svg.call(lasso);
            // }
            else{
                selGatingShape = +d.value;
            }
           
           //selGatingShape = +d.value;

        })
        .on("mouseover", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                d3.select(this)
                    .select("rect")
                    .attr("fill",hoverColor);
            }
        })
        .on("mouseout", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                d3.select(this)
                    .select("rect")
                    .attr("fill",defaultColor);
            }
        })
                
        const bWidth= 30; //button width
        const bHeight= 20; //button height
        const bSpace= 10; //space between buttons
        const x0= 20; //x offset
        const y0= 10; //y offset


        buttonGroups.append("rect")
            .attr("width", bWidth)
            .attr("height", bHeight)
            .attr("x",function(d,i) {
                return x0+(bWidth+bSpace)*i;
            })
            .attr("y",y0)
            .attr("rx",5) 
            .attr("ry",5)
            .attr("fill",defaultColor)
            .attr('stroke-width', '1')
            .attr("stroke", "red")
            .attr("opacity",0.5)
                    
        buttonGroups.append("image")
            .attr("xlink:href",function(d) { return d.url})
            .attr("x",function(d,i) {
                return 7 + x0+(bWidth+bSpace)*i;
            })
            .attr("y", y0 + 2)
            .attr("width", 16)
            .attr("height", 16);                      


        function updateButtonColors(button, parent) {
            parent.selectAll("rect")
                .attr("fill",defaultColor)

            button.select("rect")
                .attr("fill",pressedColor)
        }
}
