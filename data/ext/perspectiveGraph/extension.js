/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	console.log("Loading perspectiveGraph");

	var extensionTitle = "Graph"
	var extensionID = "perspectiveGraph";  // ID should be equal to the directory name where the ext. is located   
	var extensionType =  "perspective";
	var extensionIcon = "icon-sitemap";
	var extensionVersion = "1.0";
	var extensionManifestVersion = 1;
	var extensionLicense = "AGPL";

	var TSCORE = require("tscore");
	
	var viewContainer = undefined;
	var viewToolbar = undefined;
	var viewFooter = undefined;
	
	var viewMode = "files" // tags
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+extensionID;
	
	var graphMode = "treeMap" // tree
	
	var width = undefined;
	var height = undefined;
	var svg = undefined;
	
	var treeData = undefined;
	
	exports.init = function init() {
		console.log("Initializing View "+extensionID);
		
	    viewContainer = $("#"+extensionID+"Container");
	    viewToolbar = $("#"+extensionID+"Toolbar");
		viewFooter = $("#"+extensionID+"Footer");
		
		viewContainer.empty();
		viewToolbar.empty();
		viewFooter.empty();	  
	
	    initUI();  
	}
	
	exports.load = function load() {
		console.log("Loading View "+extensionID);

        require([
            extensionDirectory+'/d3/d3.v3.js',
            ], function() {
                viewContainer.append($('<link>', {
                       "rel":  "stylesheet",
                       "type": "text/css",
                       "href": extensionDirectory+"/styles.css"
                }));                
                $( "#"+extensionID+"ReIndexButton" ).removeClass("disabled");
                TSCORE.hideLoadingAnimation();
        });
	}
	
	var reDraw = function() {
		d3.select("svg").remove();
	
		width = viewContainer.width();
		height = viewContainer.height();
	
		svg = d3.select("#"+extensionID+"Container")
			.append("svg")
		    .attr("width", width)
		    .attr("height", height)			    			
	    
	    switch (graphMode) {
	      case "treeMap":
			drawTreeMap();
	        break;
	      case "tree":
			drawTree();
	        break;        
	      default:
	        break;
	    }
	}
	
	var drawTree2 = function() {
		var diameter = height;
		
		var tree = d3.layout.tree()
		    .size([360, diameter / 2 - 120])
		    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });
		
		var diagonal = d3.svg.diagonal.radial()
		    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
		
		svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
		
		  var nodes = tree.nodes(treeData),
		      links = tree.links(nodes);
		
		  var link = svg.selectAll(".link")
		      .data(links)
		    .enter().append("path")
		      .attr("class", "link")
		      .attr("d", diagonal);
		
		  var node = svg.selectAll(".node")
		      .data(nodes)
		    .enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
		
		  node.append("circle")
		      .attr("r", 4.5);
		
		  node.append("text")
		      .attr("dy", ".31em")
		      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		      .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
		      .text(function(d) { return d.name; });
		
		d3.select(self.frameElement).style("height", diameter - 150 + "px");
		
	}
	  
	var drawTree = function() {
		  svg.append("g").attr("transform", "translate(40,0)");
	
		  var cluster = d3.layout.cluster()
				    .size([height, width - 160]);
				
		  var diagonal = d3.svg.diagonal()
				    .projection(function(d) { return [d.y, d.x]; });	
		
		  // Setting the json data
		  var nodes = cluster.nodes(treeData); 
		  
		  var links = cluster.links(nodes);
		
		  var link = svg.selectAll(".link")
		      .data(links)
		      .enter().append("path")
		      .attr("class", "link")
		      .attr("d", diagonal);
		
		  var node = svg.selectAll(".node")
		      .data(nodes)
		      .enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
		
		  node.append("circle")
		      .attr("r", 4.5);
		
		  node.append("text")
		      .attr("dx", function(d) { return d.children ? -8 : 8; })
		      .attr("dy", 3)
		      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
		      .text(function(d) { return d.name; });
		
		  d3.select(self.frameElement).style("height", height + "px");	
	}
	
	var drawTreeMap2 = function() {
		var margin = {top: 40, right: 10, bottom: 10, left: 10},
		    width = 960 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;
		
		var color = d3.scale.category20c();
		
		var treemap = d3.layout.treemap()
		    .size([width, height])
		    .sticky(true)
		    .value(function(d) { return d.size; });
		
		var div = d3.select("body").append("div")
		    .style("position", "relative")
		    .style("width", (width + margin.left + margin.right) + "px")
		    .style("height", (height + margin.top + margin.bottom) + "px")
		    .style("left", margin.left + "px")
		    .style("top", margin.top + "px");
	
		  var node = div.datum(treeData).selectAll(".node")
		      .data(treemap.nodes)
		    .enter().append("div")
		      .attr("class", "node")
		      .call(position)
		      .style("background", function(d) { return d.children ? color(d.name) : null; })
		      .text(function(d) { return d.children ? null : d.name; });
		
		  d3.selectAll("input").on("change", function change() {
		    var value = this.value === "count"
		        ? function() { return 1; }
		        : function(d) { return d.size; };
		
		    node
		        .data(treemap.value(value).nodes)
		      .transition()
		        .duration(1500)
		        .call(position);
		  });
	
		
		var position = function () {
		  this.style("left", function(d) { return d.x + "px"; })
		      .style("top", function(d) { return d.y + "px"; })
		      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
		      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
		}
	}
	
	var drawTreeMap = function() {
		svg.append("g");
			
		var partition = d3.layout.partition()
		    .size([width, height])
		    .value(function(d) { return d.size; }); // d.size;
	
		//Setting the data
	    var nodes = partition.nodes(treeData); // treeData
	
		var color = d3.scale.category20();	
		
		  svg.selectAll(".node")
		      .data(nodes)
		      .enter().append("rect")
		      .attr("class", "node")
		      .attr("x", function(d) { return d.x; })
		      .attr("y", function(d) { return d.y; })
		      .attr("width", function(d) { return d.dx; })
		      .attr("height", function(d) { return d.dy; })
		      .style("fill", function(d) { return color((d.children ? d : d.parent).name); });
		
		  svg.selectAll(".label")
		      .data(nodes.filter(function(d) { return d.dx > 6; }))
		      .enter().append("text")
		      .attr("class", "label")
		      .attr("dy", ".35em")
		      .attr("transform", function(d) { return "translate(" + (d.x + d.dx / 2) + "," + (d.y + d.dy / 2) + ")rotate(90)"; })
		      .text(function(d) { return d.name; });	
	}
	
	exports.updateTreeData = function updateIndexData(fsTreeData) {
		console.log("Updating tree data, Rendering graph...");
		
		treeData = fsTreeData;
		
		reDraw();
				
		$( "#"+extensionID+"ReIndexButton" ).removeClass( "disabled" );   
		TSCORE.hideLoadingAnimation(); 
	}
	  
	exports.setFileFilter = function setFileFilter(filter) {
		//$( "#"+extensionID+"FilterBox").val(filter);
		//fileTable.fnFilter(filter);
	}
	
	exports.clearSelectedFiles = function() {
	    // Deselect all
	    $(".selectedRow", $(fileTable)).each(function(){
	        $(this).toggleClass('selectedRow');
	    });    
	}
	
	var initUI = function() {

        viewToolbar.append($("<div >", { 
            class: "btn-group", 
        })      
            .append($("<button>", { 
                    class: "btn", 
                    title: "Generate index tree of the current directory",
                    id: extensionID+"ReIndexButton",    
                })
                .click(function() {
                    $( "#"+extensionID+"ReIndexButton" ).addClass( "disabled" );
                    TSCORE.IO.createDirectoryTree(TSCORE.currentPath);
                })
                .append( $("<i>", { class: "icon-retweet", }) )
                .append(" Scan")
            )
     
        ) // end button group
       
        viewToolbar.append($("<div >", { 
            class: "btn-group", 
            "data-toggle": "buttons-checkbox",        
        })      
            .append($("<button>", { 
                    class: "btn", 
                    title: "Activate Treemap Mode",
                    id: extensionID+"TreeMapMode",    
                })
                .click(function() {
                    graphMode = "treeMap"
                    reDraw(); 
                })
                .append( $("<i>", { class: "icon-th-large", }) )
                .append(" TreeMap")
            )
                    
            .append($("<button>", { 
                    class: "btn", 
                    title: "Activate Tree Mode",
                    id: extensionID+"TreeMode",    
                })
                .click(function() {
                    graphMode = "tree"
                    reDraw(); 
                })          
                .append( $("<i>", { class: "icon-indent-left", }) )
                .append(" Tree")
            )        
       ) // end button group       

	}
	
    // Vars
    exports.Title                   = extensionTitle;
    exports.ID                      = extensionID;   
    exports.Type                    = extensionType;
    exports.Icon                    = extensionIcon;
    exports.Version                 = extensionVersion;
    exports.ManifestVersion         = extensionManifestVersion;
    exports.License                 = extensionLicense;
    
    // Methods
//    exports.init                    = init;
//    exports.load                    = load;
//    exports.setFileFilter           = setFileFilter;
//    exports.clearSelectedFiles      = clearSelectedFiles;
//    exports.getNextFile             = getNextFile;
//    exports.getPrevFile             = getPrevFile;	
});