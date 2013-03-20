/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	
	console.debug("Loading perspectiveGraph");

	exports.Title = "Graph"
	exports.ID = "perspectiveGraph";  // ID should be equal to the directory name where the ext. is located   
	exports.Type =  "view";
	exports.Icon = "ui-icon-shuffle";
	exports.Version = "1.0";
	exports.ManifestVersion = 1;
	exports.License = "AGPL";

	var TSCORE = require("tscore");
	
	var viewContainer = undefined;
	var viewToolbar = undefined;
	var viewFooter = undefined;
	
	var viewMode = "files" // tags
	
	var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.ID;
	
	var graphMode = "treeMap" // tree
	
	var width = undefined;
	var height = undefined;
	var svg = undefined;
	
	var treeData = undefined;
	
	var treeTestData  = { 
	 "name": "flare",
	 "children": [
	  {
	   "name": "analytics",
	   "children": [
	    {
	     "name": "cluster",
	     "children": [
	      {"name": "AgglomerativeCluster", "size": 3938},
	      {"name": "CommunityStructure", "size": 3812},
	      {"name": "HierarchicalCluster", "size": 6714},
	      {"name": "MergeEdge", "size": 743}
	     ]
	    },
	    {
	     "name": "graph",
	     "children": [
	      {"name": "BetweennessCentrality", "size": 3534},
	      {"name": "LinkDistance", "size": 5731},
	      {"name": "MaxFlowMinCut", "size": 7840},
	      {"name": "ShortestPaths", "size": 5914},
	      {"name": "SpanningTree", "size": 3416}
	     ]
	    },
	    {
	     "name": "optimization",
	     "children": [
	      {"name": "AspectRatioBanker", "size": 7074}
	     ]
	    }
	   ]
	  },
	  {
	   "name": "data",
	   "children": [
	    {
	     "name": "converters",
	     "children": [
	      {"name": "Converters", "size": 721},
	      {"name": "DelimitedTextConverter", "size": 4294},
	      {"name": "JSONConverter", "size": 2220}
	     ]
	    },
	    {"name": "DataField", "size": 1759},
	    {"name": "DataSchema", "size": 2165},
	    {"name": "DataUtil", "size": 3322}
	   ]
	  },
	  {
	   "name": "display",
	   "children": [
	    {"name": "DirtySprite", "size": 8833},
	    {"name": "LineSprite", "size": 1732},
	    {"name": "RectSprite", "size": 3623},
	    {"name": "TextSprite", "size": 10066}
	   ]
	  },
	  {
	   "name": "flex",
	   "children": [
	    {"name": "FlareVis", "size": 4116}
	   ]
	  },
	  {
	   "name": "physics",
	   "children": [
	    {"name": "DragForce", "size": 1082},
	    {"name": "SpringForce", "size": 1681}
	   ]
	  },
	  {
	   "name": "scale",
	   "children": [
	    {"name": "IScaleMap", "size": 2105},
	    {"name": "LinearScale", "size": 1316},
	    {"name": "ScaleType", "size": 1821},
	    {"name": "TimeScale", "size": 5833}
	   ]
	  },
	  {
	   "name": "util",
	   "children": [
	    {"name": "Arrays", "size": 8258},
	    {"name": "Colors", "size": 10001},
	    {"name": "Dates", "size": 8217},
	    {"name": "Displays", "size": 12555},
	    {"name": "Filter", "size": 2324},
	    {"name": "Geometry", "size": 10993},
	    {
	     "name": "heap",
	     "children": [
	      {"name": "FibonacciHeap", "size": 9354},
	      {"name": "HeapNode", "size": 1233}
	     ]
	    },
	    {
	     "name": "data",
	     "children": [
	      {"name": "Data", "size": 20544},
	      {"name": "DataList", "size": 19788},
	      {"name": "DataSprite", "size": 10349},
	      {"name": "EdgeSprite", "size": 3301},
	      {"name": "NodeSprite", "size": 19382},
	      {
	       "name": "render",
	       "children": [
	        {"name": "ArrowType", "size": 698},
	        {"name": "EdgeRenderer", "size": 5569},
	        {"name": "IRenderer", "size": 353},
	        {"name": "ShapeRenderer", "size": 2247}
	       ]
	      },
	      {"name": "ScaleBinding", "size": 11275},
	      {"name": "Tree", "size": 7147},
	      {"name": "TreeBuilder", "size": 9930}
	     ]
	    },
	    {
	     "name": "operator",
	     "children": [
	      {
	       "name": "distortion",
	       "children": [
	        {"name": "BifocalDistortion", "size": 4461},
	        {"name": "Distortion", "size": 6314},
	        {"name": "FisheyeDistortion", "size": 3444}
	       ]
	      },
	      {"name": "Operator", "size": 2490},
	      {"name": "OperatorList", "size": 5248},
	      {"name": "OperatorSequence", "size": 4190},
	      {"name": "OperatorSwitch", "size": 2581},
	      {"name": "SortOperator", "size": 2023}
	     ]
	    },
	    {"name": "Visualization", "size": 16540}
	   ]
	  }
	 ]
	};
	
	exports.init = function init() {
		console.debug("Initializing View "+exports.ID);
		
	    viewContainer = $("#"+exports.ID+"Container");
	    viewToolbar = $("#"+exports.ID+"Toolbar");
		viewFooter = $("#"+exports.ID+"Footer");
		
		viewContainer.empty();
		viewToolbar.empty();
		viewFooter.empty();	  
	
	    initContextMenus();
	    initButtons();
	    
		require([
			extensionDirectory+'/d3/d3.js',
		 	], function() {
				viewContainer.append('<link rel="stylesheet" type="text/css" href="'+extensionDirectory+"/"+'styles.css">');
		});    
	}
	
	exports.load = function load() {
		console.debug("Loading View "+exports.ID);
	
		$( "#"+exports.ID+"ReIndexButton" ).button( "enable" );
		TSCORE.hideLoadingAnimation();
	}
	
	var reDraw = function() {
		d3.select("svg").remove();
	
		width = viewContainer.width();
		height = viewContainer.height();
	
		svg = d3.select("#"+exports.ID+"Container")
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
		console.debug("Updating tree data, Rendering graph...");
		
		treeData = fsTreeData;
		
		reDraw();
				
		$( "#"+exports.ID+"ReIndexButton" ).button( "enable" );		   
		TSCORE.hideLoadingAnimation(); 
	}
	  
	exports.setFileFilter = function setFileFilter(filter) {
		$( "#"+exports.ID+"FilterBox").val(filter);
		fileTable.fnFilter(filter);
	}
	
	exports.clearSelectedFiles = function() {
	    // Deselect all
	    $(".selectedRow", $(fileTable)).each(function(){
	        $(this).toggleClass('selectedRow');
	    });    
	}
	
	var initButtons = function() {
	    viewToolbar.append($("<span>", { 
	    	style: "float: right; margin: 0px; padding: 0px;",
	    }).append($("<input>", { 
			type: "filter",
			// autocomplete: "off", // Error: cannot call methods on autocomplete prior to initialization; attempted to call method 'off' 
	        title: "This filter applies to current directory without subdirectories.",
	        id: exports.ID+"FilterBox",    
	    })));
	   
	    // Filter functionality
	    $("#"+exports.ID+"FilterBox").keyup(function() {
			// TODO filter action here
	        console.debug("Filter to value: "+this.value);
	    });  
	    
	    $('#'+exports.ID+"FilterBox").wrap('<span id="resetFilter" />').after($('<span/>').click(function() {
	        $(this).prev('input').val('').focus();
	        // TODO filter action here  
	    }));  
	
	    $( "#clearFilterButton" ).button({
	        text: false,
	        disabled: false,
	        icons: {
	            primary: "ui-icon-close"
	        }
	    })
	    .click(function() {
	        $( "#filterBox" ).val( "" );
	        fileTable.fnFilter( "" );        
	    });
	    
	    viewToolbar.append($("<button>", { 
	        text: "Scan Directory",
			disabled: true,
	        title: "Generate File System Tree",
	        id: exports.ID+"ReIndexButton",    
	    }));
	
	    $( "#"+exports.ID+"ReIndexButton" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-refresh"
	        }
	    })
	    .click(function() {
		    $( "#"+exports.ID+"ReIndexButton" ).button( "disable" );
			TSCORE.IO.createDirectoryTree(TSCORE.currentPath);
	    });        
	    
	/*    viewToolbar.append($("<label>", { 
	        for: exports.ID+"ModeSwitcher",    
			text: "Mode",
	    }));*/
	    
	    var modeSwitcher =  viewToolbar.append($("<span>", { 
	        id: exports.ID+"ModeSwitcher",    
	    }));
	    
	    modeSwitcher.append($("<input>", { 
	        type: "radio",
	        name: "modeSwitcher",
	        checked: true,
	        id: exports.ID+"TreeMapMode",    
	    }));
	
	    modeSwitcher.append($("<label>", { 
	        for: exports.ID+"TreeMapMode",
	        text: "TreeMap", 
	    }));
	    
	    modeSwitcher.append($("<input>", { 
	        type: "radio",
	        name: "modeSwitcher",
	        id: exports.ID+"TreeMode",    
	    }));
	
	    modeSwitcher.append($("<label>", { 
	        for: exports.ID+"TreeMode",
	        text: "Tree", 
	    }));   
	        
	    $( "#"+exports.ID+"TreeMapMode" ).button({
		        text: true,
		    })        
		.click(function() {
			graphMode = "treeMap"
			reDraw(); 
		})        
		
	    $( "#"+exports.ID+"TreeMode" ).button({
		        text: true,
		    })        
		.click(function() {
			graphMode = "tree"
			reDraw(); 
		})        
		
	    modeSwitcher.buttonset();
	}
	
	var initContextMenus = function() {
	    $( "#fileTitleMenu" ).menu({
	        select: function( event, ui ) {
	            var commandName = ui.item.attr( "action" );
	            switch (commandName) {
	              case "openFile":
	        		TSCORE.openFile(TSCORE.selectedFiles[0]);                
	                break;
	              case "addTag":        
	                console.debug("Adding tag..."); 
	                $("#tags").val("");
	                $( "#dialogAddTags" ).dialog( "open" );
	                break;  
	              default:
	                break;
	            }
	        }         
	    }); 
	}

});