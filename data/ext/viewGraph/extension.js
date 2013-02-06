/* Copyright (c) 2012 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define([
    'require',
    'exports',
    'module',
],function(require, exports, module) {
"use strict";

exports.Title = "Graph View"
exports.ID = "viewGraph";  // ID should be equal to the directory name where the ext. is located   
exports.Type =  "view";
exports.Icon = "ui-icon-search";
exports.Version = "1.0";
exports.ManifestVersion = 1;
exports.License = "AGPL";

console.debug("Loading viewGraph/extension.js... ");

var viewContainer = undefined;
var viewToolbar = undefined;
var viewFooter = undefined;

var viewMode = "files" // tags

var extensionDirectory = TSSETTINGS.getExtensionPath()+UIAPI.getDirSeparator()+exports.ID;

var graphMode = "treeMap" // tree

var width = undefined;
var height = undefined;
var svg = undefined;

var treeData = undefined;

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
			
			viewContainer.append('<link rel="stylesheet" type="text/css" href="'+extensionDirectory+UIAPI.getDirSeparator()+'styles.css">');
	 		
			width = viewContainer.width();
			height = viewContainer.height();
						
			svg = d3.select("#"+exports.ID+"Container")
				.append("svg")
			    .attr("width", width)
			    .attr("height", height)			    			
			    .append("g")
			    .attr("transform", "translate(40,0)");
	});    
}

exports.load = function load() {
	console.debug("Loading View "+exports.ID);


	$( "#"+exports.ID+"ReIndexButton" ).button( "enable" );
	UIAPI.hideLoadingAnimation();

}

var treeDataTest  = { 
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
  
var drawTree = function() {
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

var drawTreeMap = function() {
	
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
	
	drawTreeMap();
			
	$( "#"+exports.ID+"ReIndexButton" ).button( "enable" );		   
	UIAPI.hideLoadingAnimation(); 
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
    
// Initialize file buttons    
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
		IOAPI.createDirectoryTree(UIAPI.currentPath);
    });        
   
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
    
    modeSwitcher.buttonset();
        
    $( "#"+exports.ID+"TreeMapMode" ).button({
	        text: true,
	        icons: {
	            primary: "ui-icon-document-b"
	        }
	    })        
	.click(function() {
		graphMode = "treeMap" 
		// Redraw
	})        
}

var initContextMenus = function() {
    $( "#fileTitleMenu" ).menu({
        select: function( event, ui ) {
            var commandName = ui.item.attr( "action" );
            switch (commandName) {
              case "openFile":
        		UIAPI.openFile(UIAPI.currentPath+UIAPI.getDirSeparator()+UIAPI.selectedFiles[0]);                
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