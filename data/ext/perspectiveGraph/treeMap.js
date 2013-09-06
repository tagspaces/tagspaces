/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
    console.log("Loading Tree Map");

    var TSCORE = require("tscore");

    require("d3");
    
    // Based on http://mbostock.github.io/d3/talk/20111018/treemap.html
    var drawZoomableTreeMap = function(svg, treeData) {
            
        var partition = d3.layout.partition()
            .size([svg.attr("width"), svg.attr("height")])
            .value(function(d) { return d.size; }); 
    
        //Setting the data

        var w = svg.attr("width"),
            h = svg.attr("height"),
            x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, h]),
            color = d3.scale.category20c(),
            root,
            node;            
        
        var treemap = d3.layout.treemap()
            .round(false)
            .size([w, h])
            .sticky(true)
            .value(function(d) { return d.size; });
        
        svg.append("svg:g")
            .attr("transform", "translate(.5,.5)");        

          node = root = treeData;
        
          var nodes = treemap.nodes(root)
              .filter(function(d) { return !d.children; });
        
          var cell = svg.selectAll("g")
              .data(nodes)
            .enter().append("svg:g")
              .attr("class", "cell")
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
              .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });
        
          cell.append("svg:rect")
              .attr("width", function(d) { return d.dx - 1; })
              .attr("height", function(d) { return d.dy - 1; })
              .style("fill", function(d) { return color(d.parent.name); });
        
          cell.append("svg:text")
              .attr("x", function(d) { return d.dx / 2; })
              .attr("y", function(d) { return d.dy / 2; })
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .text(function(d) { return d.name; })
              .style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
        
          d3.select(window).on("click", function() { zoom(root); });
        
          d3.select("select").on("change", function() {
            treemap.value(this.value == "size" ? size : count).nodes(root);
            zoom(node);
          });

        
        function size(d) {
          return d.size;
        }
        
        function count(d) {
          return 1;
        }
        
        function zoom(d) {
          var kx = w / d.dx, ky = h / d.dy;
          x.domain([d.x, d.x + d.dx]);
          y.domain([d.y, d.y + d.dy]);
        
          var t = svg.selectAll("g.cell").transition()
              .duration(d3.event.altKey ? 7500 : 750)
              .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
        
          t.select("rect")
              .attr("width", function(d) { return kx * d.dx - 1; })
              .attr("height", function(d) { return ky * d.dy - 1; })
        
          t.select("text")
              .attr("x", function(d) { return kx * d.dx / 2; })
              .attr("y", function(d) { return ky * d.dy / 2; })
              .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
        
          node = d;
          d3.event.stopPropagation();
        }        
    }    
    
    // Based on http://mbostock.github.io/d3/talk/20111018/partition.html    
    // Not working
    var drawTreeMap = function(svg, treeData) {
        //svg.append("g");
            
        var partition = d3.layout.partition()
            .size([svg.attr("width"), svg.attr("height")])
            .value(function(d) { return d.size; }); 
    
        //Setting the data

        var w = svg.attr("width"),
            h = svg.attr("height"),
            x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, h]);

          var g = svg.selectAll("g")
              .data(partition.nodes(treeData))
            .enter().append("svg:g")
              .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
              .on("click", click);
        
          var kx = w / root.dx,
              ky = h / 1;
        
          g.append("svg:rect")
              .attr("width", root.dy * kx)
              .attr("height", function(d) { return d.dx * ky; })
              .attr("class", function(d) { return d.children ? "parent" : "child"; });
        
          g.append("svg:text")
              .attr("transform", transform)
              .attr("dy", ".35em")
              .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; })
              .text(function(d) { return d.name; })
        
          d3.select(window)
              .on("click", function() { click(root); })
        
          function click(d) {
            if (!d.children) return;
        
            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
            y.domain([d.x, d.x + d.dx]);
        
            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });
        
            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function(d) { return d.dx * ky; });
        
            t.select("text")
                .attr("transform", transform)
                .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });
        
            d3.event.stopPropagation();
          }
        
          function transform(d) {
            return "translate(8," + d.dx * ky / 2 + ")";
          }


    }    
    
    // Methods
    exports.drawTreeMap                    = drawTreeMap;
    exports.drawZoomableTreeMap            = drawZoomableTreeMap;

});