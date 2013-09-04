/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
    console.log("Loading Quantified Self");

    var TSCORE = require("tscore");

    require("d3");
        
    var drawTree2 = function(svg, treeData) {
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
      
    var drawTree = function(svg, treeData) {
                    
          svg.append("g").attr("transform", "translate(40,0)");
    
          var cluster = d3.layout.cluster()
                    .size([svg.attr("height"), svg.attr("width") - 160]);
                
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
        
          d3.select(self.frameElement).style("height", svg.attr("height") + "px");  
    }
    
    var drawTreeMap2 = function(svg, treeData) {
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
    
    var drawTreeMapZoom = function(svg, treeData) {
        // http://bl.ocks.org/mbostock/raw/1005873/e741416b4271859f1dfb3e0440d2f20bfc989e27/
        var w = 960,
            h = 500,
            x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, h]),
            color = d3.scale.category20c();
        
        var vis = d3.select("#chart").append("svg:svg")
            .attr("width", w)
            .attr("height", h);
        
        var partition = d3.layout.partition()
            .children(function(d) { return isNaN(d.value) ? d3.entries(d.value) : null; })
            .value(function(d) { return d.value; });
        
        d3.json("readme.json", function(json) {
          var rect = vis.selectAll("rect")
              .data(partition(d3.entries(json)[0]))
            .enter().append("svg:rect")
              .attr("x", function(d) { return x(d.x); })
              .attr("y", function(d) { return y(d.y); })
              .attr("width", function(d) { return x(d.dx); })
              .attr("height", function(d) { return y(d.dy); })
              .attr("fill", function(d) { return color((d.children ? d : d.parent).data.key); })
              .on("click", click);
        
          function click(d) {
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, 1]).range([d.y ? 20 : 0, h]);
        
            rect.transition()
              .duration(750)
              .attr("x", function(d) { return x(d.x); })
              .attr("y", function(d) { return y(d.y); })
              .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
              .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
          }
        });        
    }
    
    var drawTreeMap = function(svg, treeData) {
        svg.append("g");
            
        var partition = d3.layout.partition()
            .size([svg.attr("width"), svg.attr("height")])
            .value(function(d) { return d.size; }); 
    
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
    
    // Methods
    exports.drawTreeMap                    = drawTreeMap;
    exports.drawTree                       = drawTree;
    
});