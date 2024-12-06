function _1(md){return(
md`# DamNet : by EcoMappers`
)}

function _selected_continent(Inputs,dams_continent){return(
Inputs.select(dams_continent, {value: "North America", label: "Continent"})
)}

function* _dam_visualization(DOM,width,L,zoom,selected_continent,d3,dam_connections,dams)
{
    let container = DOM.element('div', { style: `position: relative; width:${width}px;height:600px`, 
                                        className: 'custom-leaflet-map'});
    
     yield container;

  
    let map = L.map(container).setView(zoom(selected_continent).slice(0, 2), zoom(selected_continent)[2])
    let CartoDB_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    maxZoom: 20
  }).addTo(map); 

  //initialize svg to add to map
    L.svg({clickable: true}).addTo(map)
   
    function projectPoint(x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
}
  
   const transform = d3.geoTransform({ point: projectPoint });
   const geopath = d3.geoPath().projection(transform);
   // Define some attributes
    const dam_marker_radius = zoom(selected_continent)[3];
    const dam_marker_color = "#010127" //"#004182";
    const hover_dam_marker_color = "#F38500";
    const hover_dam_marker_radius = 10;
    const upstream_dam_marker_color = "red";
    const upstream_dam_marker_radius = 7;
    const downstream_dam_marker_color = "green";
    const downstream_dam_marker_radius = 7;

  // Create SVG
    const svg = d3.select(map.getPanes().overlayPane)
                .select('svg')
                .attr("pointer-events", "auto")
    
    // Add a legend for dams being hovered over
    const legendContainer = d3.select(container)
      .append("div")
      .attr("class", "legend")
      .style("position", "absolute")
      .style("bottom", "90px")
      .style("left", "20px")
      .style("color", "black")
      .style("font-size","13px")
      .style("background-color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("opacity","0.9")
      .style("display", "none") // Initially hide the legend
      .style("z-index", "1001"); 
  
    const legendData = [
      { color: upstream_dam_marker_color, label: "Upstream Dam w.r.t selected dam" },
      { color: hover_dam_marker_color, label: "Selected Dam" },
      { color: downstream_dam_marker_color, label: "Downstream Dam w.r.t selected dam" }
    ];
  
    // Append legend entries to the legend container
    const legendEntries = legendContainer.selectAll(".legend-entry")
      .data(legendData)
      .enter()
      .append("div")
      .attr("class", "legend-entry");

    // Append colored circles and labels to legend entries
    legendEntries.append("svg")
      .attr("width", 20)
      .attr("height", 20)
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 15)
      .attr("r", 5)
      .attr("fill", d => d.color);
    
    legendEntries.append("span")
      .text(d => d.label);
  
    const nameContainer = d3.select(container)
      .append("div")
      .attr("class", "legend")
      .style("position", "absolute")
      .style("bottom", "30px")
      .style("right", "20px")
      .style("color", "black")
      .style("font-size","14px")
      .style("font-weight","bold")
      .style("background-color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("opacity","0.95")
      .style("display", "none") // Initially hide the container
      .style("z-index", "1001");

    const selectedDamContainer = d3.select(container)
      .append("div")
      .attr("class", "legend")
      .style("position", "absolute")
      .style("bottom", "190px")
      .style("left", "20px")
      .style("color", "black")
      .style("font-size","13px")
      // .style("font-weight","bold")
      .style("background-color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("opacity","0.9")
      .style("display", "none") // Initially hide the container
      .style("z-index", "1001");
  
    // Add a gradient for the connections from left to right
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#00BFFF"); 
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#00008B");

  // Add a reverse gradient for the connections from left to right 
  const gradientReverse = defs.append("linearGradient")
    .attr("id", "gradient-reverse")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%");
  
  gradientReverse.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#00BFFF");
  
  gradientReverse.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#00008B");

  // Add a line for each link, and a circle for each node.
  const links = svg.append("g")
                  .selectAll("line")
                  .data(dam_connections)
                  .join("line")
                  .attr("class", l => `link-${l.source}-${l.target}`)
                  .style("display", null)
                  .attr("x1", l => {
                    const x1 = d3.filter(dams, d => d.properties.ID == l.source)[0];
                    return map.latLngToLayerPoint([x1.geometry.coordinates[1], x1.geometry.coordinates[0]]).x;
                  })
                  .attr("y1", l => {
                    const y1 = d3.filter(dams, d => d.properties.ID == l.source)[0];
                    return map.latLngToLayerPoint([y1.geometry.coordinates[1], y1.geometry.coordinates[0]]).y;
                  })
                  .attr("x2", l => {
                    const x2 = d3.filter(dams, d => d.properties.ID == l.target)[0];
                    return map.latLngToLayerPoint([x2.geometry.coordinates[1], x2.geometry.coordinates[0]]).x;
                  })
                  .attr("y2", l => {
                    const y2 = d3.filter(dams, d => d.properties.ID == l.target)[0];
                    return map.latLngToLayerPoint([y2.geometry.coordinates[1], y2.geometry.coordinates[0]]).y;
                  })
                  // .attr("stroke","url(#gradient)")
                  .attr("stroke", function(l) {
                    const x1 = map.latLngToLayerPoint([d3.filter(dams, d => d.properties.ID == l.source)[0].geometry.coordinates[1], d3.filter(dams, d => d.properties.ID == l.source)[0].geometry.coordinates[0]]).x;
                    const x2 = map.latLngToLayerPoint([d3.filter(dams, d => d.properties.ID == l.target)[0].geometry.coordinates[1], d3.filter(dams, d => d.properties.ID == l.target)[0].geometry.coordinates[0]]).x;
                    return x1 <= x2 ? "url(#gradient)" : "url(#gradient-reverse)";
                  })
                  .attr("stroke-opacity", 0.8)
                  .attr("stroke-width", d => Math.sqrt(4));

  const damData = dams.map(dam => ({
  ...dam, // include original dam properties
  concentricRadii: [dam_marker_radius, dam_marker_radius * 1.2, dam_marker_radius * 5] // array of radii for concentric circles
}));
  
    const Dots = svg
          .append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .selectAll('circle')
          .attr("class", "Dots")
          .data(damData) 
          .join('circle')

      Dots
          .attr("id", "dotties")
          .attr("fill", dam_marker_color) 
          .attr("r", dam_marker_radius) 
          .attr("stroke", "white")
          .attr("opacity", 0.5)
    //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
    //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
    //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
          .attr("cx", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).x)
          .attr("cy", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).y)
          .style("cursor","crosshair"); // Cursor over the dots.

  
    const tooltip = svg.append("g").style("display", "none")
    const path = tooltip.append("path")
    const text = tooltip.append("text")
    var nameText = nameContainer.append('text')
    var selectedDamTitle = selectedDamContainer.append('p');
    selectedDamTitle.text("Selected Dam's Information \n")
                    .attr("text-align","center")
                    .style("margin","0.5em 1em 1em 0.5em")
                    .style("font-weight","bold")
                    .style("font-size","14px");
    var selectedDamText = selectedDamContainer.append('div')
                                              .attr('id', 'info');
    
  
    // Flag to know if mouse is over a dam marker or not
    let animationInProgress = false;
    // Flag to see if mouseclick function is on
    let isMouseClick = false;
  
    Dots
      .on('mouseover', function(e, d) { 
        //function to add mouseover event
        var textLabel = ""
      
            if (d.properties.DAM_NAME){
              if(d.properties.RIVER){
                  textLabel = "Dam: " + d.properties.DAM_NAME + ", on the river "
                  + d.properties.RIVER
                }
              else{
                  textLabel = "Dam: " + d.properties.DAM_NAME
              }
            }
            else{
              textLabel = "Dam Name is unknown."
            }
        nameText
                .text(textLabel)
        // Show the dam name on mouse over
        nameContainer.style("display", "block");
        
        if(!isMouseClick){
            // const [xm, ym] = d3.pointer(e)
              
            d3.select(this)
              .transition() //D3 selects the object we have moused over in order to perform operations on it
              .duration('150') //how long we are transitioning between the two states (works like keyframes)
              .ease(d3.easeBounce)
              .attr("fill", hover_dam_marker_color) //change the fill
              .attr('r', hover_dam_marker_radius); //change radius
                      
         // tooltip
            // tooltip
            //     .transition()
            //     .duration(200)
            //     .style("display", null)
            // tooltip.attr("transform", `translate(${xm + 4},${ym + 20})`);
      
            // path.attr("fill", "white").attr("stroke", "black");
            
            // text
            //     .text(textLabel)
            //     .attr("font-size", 11)
            // size(text, path)

          // highlighting links connected to d only
          links.style("opacity", 0)
          links.filter(l => l.source === d.properties.ID || l.target === d.properties.ID)
              .style("opacity", 1);
  
          // Highlight upstream and downstream dots connected to d
          Dots.attr("fill", dam_marker_color); // Reset all dots to default color
  
          Dots.filter(dot => dam_connections.some(conn => conn.source === d.properties.ID && conn.target === dot.properties.ID))
              .attr("fill", downstream_dam_marker_color) // Color for downstream dots
              .attr("r",downstream_dam_marker_radius); // Radius for downstream dots
          
          Dots.filter(dot => dam_connections.some(conn => conn.target === d.properties.ID && conn.source === dot.properties.ID))
              .attr("fill", upstream_dam_marker_color) // Color for upstream dots
              .attr("r",upstream_dam_marker_radius); // Radius for upstream dots
          
          // Show the legend on hover
          legendContainer.style("display", "block");
        }
      })

      Dots.on('mouseout', function() { 
        if(!isMouseClick){
          
          //reverse the action based on when we mouse off the the circle
            d3.select(this).transition()
                  .duration('150')
                  .ease(d3.easeBounce)
                  .attr("fill", dam_marker_color)
                  .attr('r', dam_marker_radius)
      
            tooltip
                .style("display", "none")
  
            // Reset all links
            links.style("opacity", 1)
            // Reset all dots to default color and radius
            Dots.attr("fill", dam_marker_color)
                .attr("r",dam_marker_radius); 
  
            // Hide the legend when mouse leaves the dam marker
            legendContainer.style("display", "none");
        }
        nameContainer.style("display", "none");
      })

    Dots.on('click', function(e, d) {
      if(!isMouseClick){
        //Change the flag to show mouse is clicked
        isMouseClick = true;
        // Reset all links
        links.style("opacity", 1)
        // Reset all dots to default color and radius
        Dots.attr("fill", dam_marker_color)
            .attr("r",dam_marker_radius);
        // Highlight the selected dot
        d3.select(this)
          .attr("fill", hover_dam_marker_color) //change the fill
          .attr('r', hover_dam_marker_radius); //change radius
        // Show the selected dam information
        const selected_DAM_NAME = d.properties.DAM_NAME ? d.properties.DAM_NAME : "Unkown";
        const selected_COUNTRY = d.properties.COUNTRY ? d.properties.COUNTRY : "Unkown";
        const selected_RIVER = d.properties.RIVER ? d.properties.RIVER : "Unkown";
        const selected_MAIN_BASIN = d.properties.MAIN_BASIN ? d.properties.MAIN_BASIN : "Unkown";
        const selected_YEAR = (d.properties.YEAR && d.properties.YEAR>0) ? d.properties.YEAR : "Unkown";
        const selected_CAP_MCM = d.properties.CAP_MCM ? d.properties.CAP_MCM+" MCM" : "Unkown";
        const selected_AREA_SKM = d.properties.AREA_SKM ? d.properties.AREA_SKM+" Sq. Km" : "Unkown";
        const selected_DEPTH_M = d.properties.DEPTH_M ? d.properties.DEPTH_M+" m" : "Unkown";
        const selected_ELEV_MASL = d.properties.ELEV_MASL ? d.properties.ELEV_MASL+" m" : "Unkown";
        const selected_GRAND_ID = d.properties.GRAND_ID ? d.properties.GRAND_ID : "Unkown";

        const selectedDamInfoTextArray = [
            "DAM        : " + selected_DAM_NAME,
            "COUNTRY    : " + selected_COUNTRY,
            "RIVER      : " + selected_RIVER,
            "MAIN BASIN : " + selected_MAIN_BASIN,
            "YEAR       : " + selected_YEAR,
            "CAPACITY   : " + selected_CAP_MCM,
            "AREA       : " + selected_AREA_SKM,
            "DEPTH      : " + selected_DEPTH_M,
            "ELEVATION  : " + selected_ELEV_MASL,
            "GRAND ID   : " + selected_GRAND_ID
        ];
        
        // Clear any existing content
        selectedDamText.selectAll("*").remove();
        
        // Append new content
        selectedDamText.selectAll("p")
            .data(selectedDamInfoTextArray)
            .enter().append("p")
            .style("text-align", "left")
            .style("margin", "0 0 0.5em 1em") 
            .style("padding", "0")
            .text(function(d) { return d; });
        selectedDamContainer.style("display", "block");
        
        //Change the flag to id of dam to show mouse is over a dam_marker
        animationInProgress = d.properties.ID;
         // highlighting links connected to d only
        links.style("opacity", 0)
        // highlight & color downstream links & dams
        selectLinks(d.properties.ID, true);
        // highlight & color upstream links & dams
        selectLinks(d.properties.ID, false);
      }
      else{
        //Change the flags to false to show mouse click has been removed
        isMouseClick = false;
        animationInProgress = false;
        // Remove the selected dam information
        selectedDamContainer.style("display", "none");
        // Reset all links
        links.style("opacity", 1)
        // Reset all dots to default color and radius
        Dots.attr("fill", dam_marker_color)
            .attr("r",dam_marker_radius);
      }
    })
  
  

  // Add a colorbar for showing direction
     const colorbarContainer = d3.select(container)
      .append("div")
      .attr("class", "fixed-legend")
      .style("position", "absolute")
      .style("bottom", "20px")
      .style("left", "20px")
      .style("color", "black")
      .style("font-size", "12px")
      .style("background-color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("opacity", "0.9")
      .style("z-index", "1000");

    const colorbar_svg = colorbarContainer.append("svg")
      .attr("width", 218)
      .attr("height", 40)
        
    colorbar_svg.append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 200)
      .attr("height", 10)
      .style("fill", "url(#gradient)");

  colorbar_svg.append("polygon")
    .attr("points", "210,10 220,15 210,20")
    .style("fill", "#00008B"); // Dark blue color

  colorbar_svg.append("text")
    .attr("x", 100)
    .attr("y", 40)
    .text("Water flow direction ➔")
    .style("font-size", "14.5px")
    .style("font-weight","bold")
    .style("fill", "url(#gradient)")
    .attr("text-anchor", "middle");

  
  // // Wraps the text with a callout path of the correct size, as measured in the page.
  // function size(text, path) {
  //   const {x, y, width: w, height: h} = text.node().getBBox();
  //   text.attr("transform", `translate(${-w / 2},${15 - y})`);
  //   path.attr("d", `M${-w / 2 - 10}, 5H-5l5, -5l5, 5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
  // }

function selectLinks(nodeId, source = true) {
    if (animationInProgress !== nodeId) return;  
  
    const nodeQueue = [nodeId];
    const visitedNodes = new Set();
    let delay = 0;

    function processNextLevel() {
        if (nodeQueue.length === 0 || animationInProgress !== nodeId) return;

        const nextQueue = [];

        while (nodeQueue.length > 0) {
            const currentNodeId = nodeQueue.shift();
            if (visitedNodes.has(currentNodeId)) continue;

            visitedNodes.add(currentNodeId);

            // Select links based on whether 'currentNodeId' is the source or target
            const filteredLinks = links.filter(link => source ? link.source === currentNodeId : link.target === currentNodeId);
            
            // Select dots based on whether 'currentNodeId' is the source or target
            const filteredDots = Dots.filter(dot => 
                dam_connections.some(link => 
                    source ? (link.target === dot.properties.ID && link.source === currentNodeId) 
                           : (link.source === dot.properties.ID && link.target === currentNodeId)
                )
            );

            // Display the filtered links
            filteredLinks.style("opacity", 1);

            // Change the color and radius of filtered dots based on source or target
            if (source) {
                filteredDots
                    .attr("fill", downstream_dam_marker_color) // Color for downstream dots
                    .attr("r", downstream_dam_marker_radius);  // Radius for downstream dots
            } else {
                filteredDots
                    .attr("fill", upstream_dam_marker_color)   // Color for upstream dots
                    .attr("r", upstream_dam_marker_radius);    // Radius for upstream dots
            }

            // Add connected nodes to the next level queue
            filteredDots.each(function(d) {
                const connectedNodeId = d.properties.ID;
                if (!visitedNodes.has(connectedNodeId)) {
                    nextQueue.push(connectedNodeId);
                }
            });
        }

        nodeQueue.push(...nextQueue);
        setTimeout(processNextLevel, 300); // Set the delay as needed
    }

    processNextLevel();
}

        
    const update_network = function () { 
            Dots
              .attr("cx", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).x)
              .attr("cy", d => map.latLngToLayerPoint([d.geometry.coordinates[1],d.geometry.coordinates[0]]).y) 

            links
              .attr("x1", l => {
                const x1 = d3.filter(dams, d => d.properties.ID == l.source)[0];
                // console.log(dams)
                // console.log(x1)
                return map.latLngToLayerPoint([x1.geometry.coordinates[1], x1.geometry.coordinates[0]]).x;
              })
              .attr("y1", l => {
                const y1 = d3.filter(dams, d => d.properties.ID == l.source)[0];
                return map.latLngToLayerPoint([y1.geometry.coordinates[1], y1.geometry.coordinates[0]]).y;
              })
              .attr("x2", l => {
                const x2 = d3.filter(dams, d => d.properties.ID == l.target)[0];
                return map.latLngToLayerPoint([x2.geometry.coordinates[1], x2.geometry.coordinates[0]]).x;
              })
              .attr("y2", l => {
                const y2 = d3.filter(dams, d => d.properties.ID == l.target)[0];
                return map.latLngToLayerPoint([y2.geometry.coordinates[1], y2.geometry.coordinates[0]]).y;
              })

          //legend.attr("transform", "translate(25, 500)");
    }
    map.on("zoomend", update_network)

}


function _dam_connections_data(FileAttachment){return(
FileAttachment("dam_connections.json").json()
)}

function _dam_connections(d3,dam_connections_data,dams){return(
d3.filter(dam_connections_data,l => dams.map(data => data.properties.ID).includes(l.source) & dams.map(data =>data.properties.ID).includes(l.target))
)}

function _dams_continent(){return(
['All Continents','Africa','Australia','Eurasia','North America','Oceania','South America']
)}

function _dams(d3,dams_json,selected_continent){return(
d3.filter(dams_json.features, d => {
  if(selected_continent == 'All Continents'){ 
    return true;
  }
  else{
   return d.properties.CONTINENT==selected_continent;
  }
})
)}

function _dams_json(FileAttachment){return(
FileAttachment("dams_info_final.geojson").json()
)}

function _zoom(){return(
function zoom(selected_continent) {
  if (selected_continent == 'Africa') {
    return [10, 10, 3.2, 4]; // Return an array with latitude, longitude, zoom level and dam_marker_radius
  } else if (selected_continent == 'Australia') {
    return [-25, 135, 4, 4];
  } else if (selected_continent == 'North America') {
    return [40, -100, 3.5, 3];
  } else if (selected_continent == 'South America') {
    return [-20, -60, 3, 4];
  } else if (selected_continent == 'Oceania') {
    return [-42, 172, 5, 4];
  } else if (selected_continent == 'Eurasia') {
    return [45, 90, 2.5, 4];
  }
  else {
    return [15, 15, 2, 2]; // Return an array with latitude, longitude, zoom level and dam_marker_radius
  }
}
)}

async function _L(require,html)
{
  const L = await require("leaflet@1/dist/leaflet.js")
  if (!L._style) {
    const href = await require.resolve("leaflet@1/dist/leaflet.css")
    document.head.appendChild(L._style = html`<link href=${href} rel=stylesheet>`)
  }
  return L
}


function _11(html){return(
html`<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />`
)}

function _leaflet(require){return(
require("leaflet@1.7.1")
)}

function _d3(require){return(
require("d3@7")
)}

function _14(htl){return(
htl.html`<style>
  .custom-leaflet-map {
    cursor:crosshair !important;
  }

</style>`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["dams_info_final.geojson", {url: new URL("./files/81625db7c13be6177051af906327e0f5c6afb708755f637e0036661e753e0fdc9991917d26d398365493782ace44baf0e1a72434a5aa8591b2cf7ba6bb10d974.geojson", import.meta.url), mimeType: "application/geo+json", toString}],
    ["dam_connections.json", {url: new URL("./files/db83a621e46c6b65d6bdd7c423f233f4417c6c29654541906c449ee9d638876e6e6c39c999cd55bdb523ee51ba4be91a15155311af38d2138d66076279f90968.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof selected_continent")).define("viewof selected_continent", ["Inputs","dams_continent"], _selected_continent);
  main.variable(observer("selected_continent")).define("selected_continent", ["Generators", "viewof selected_continent"], (G, _) => G.input(_));
  main.variable(observer("dam_visualization")).define("dam_visualization", ["DOM","width","L","zoom","selected_continent","d3","dam_connections","dams"], _dam_visualization);
  main.variable(observer("dam_connections_data")).define("dam_connections_data", ["FileAttachment"], _dam_connections_data);
  main.variable(observer("dam_connections")).define("dam_connections", ["d3","dam_connections_data","dams"], _dam_connections);
  main.variable(observer("dams_continent")).define("dams_continent", _dams_continent);
  main.variable(observer("dams")).define("dams", ["d3","dams_json","selected_continent"], _dams);
  main.variable(observer("dams_json")).define("dams_json", ["FileAttachment"], _dams_json);
  main.variable(observer("zoom")).define("zoom", _zoom);
  main.variable(observer("L")).define("L", ["require","html"], _L);
  main.variable(observer()).define(["html"], _11);
  main.variable(observer("leaflet")).define("leaflet", ["require"], _leaflet);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["htl"], _14);
  return main;
}
