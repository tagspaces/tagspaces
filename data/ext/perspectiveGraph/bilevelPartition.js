/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
    console.log("Loading Quantified Self");

    var TSCORE = require("tscore");

    require("d3");
    
    // Based on http://bl.ocks.org/mbostock/5944371
    var drawPartition = function(svg, treeData) {
            
        var margin = {top: 350, right: 480, bottom: 350, left: 480},
            radius = Math.min(margin.top, margin.right, margin.bottom, margin.left);
        
        var hue = d3.scale.category10();
        
        var luminance = d3.scale.sqrt()
            .domain([0, 1e6])
            .clamp(true)
            .range([90, 20]);        

        svg.append("g")
            .attr("transform", "translate(.5,.5)");
        
        var partition = d3.layout.partition()
            .sort(function(a, b) { return d3.ascending(a.name, b.name); })
            .size([2 * Math.PI, radius]);
        
        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return radius / 3 * d.depth; })
            .outerRadius(function(d) { return radius / 3 * (d.depth + 1); });

        
          // Compute the initial layout on the entire tree to sum sizes.
          // Also compute the full name and fill color for each node.
          partition
              .value(function(d) { return d.size; })
              .nodes(treeData)
              .forEach(function(d) { d.sum = d.value; d.key = key(d); d.fill = fill(d); });
        
          // Now redefine the value function to use the previously-computed sum.
          partition
              .children(function(d, depth) { return depth < 2 ? d.children : null; })
              .value(function(d) { return d.sum; });
        
          var center = svg.append("circle")
              .attr("r", radius / 3)
              .on("click", zoomOut);
        
          center.append("title")
              .text("zoom out");
        
          var path = svg.selectAll("path")
              .data(partition.nodes(treeData).slice(1))
            .enter().append("path")
              .attr("d", arc)
              .style("fill", function(d) { return d.fill; })
              .each(function(d) { this._current = updateArc(d); })
              .on("click", zoomIn);
        
          function zoomIn(p) {
            if (p.depth > 1) p = p.parent;
            if (!p.children) return;
            zoom(p, p);
          }
        
          function zoomOut(p) {
            if (!p.parent) return;
            zoom(p.parent, p);
          }
        
          // Zoom to the specified new root.
          function zoom(root, p) {
            if (document.documentElement.__transition__) return;
        
            // Stash the original root dimensions for transitions.
            var angle1 = d3.scale.linear()
                .domain([0, 2 * Math.PI])
                .range([root.x, root.x + root.dx]);
        
            function insideArc(d) {
              return p.key > d.key
                  ? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
                  ? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
                  : {depth: 0, x: 0, dx: 2 * Math.PI};
            }
        
            function outsideArc(d) {
              return {depth: d.depth + 1, x: angle1(d.x), dx: angle1(d.x + d.dx) - angle1(d.x)};
            }
        
            // When zooming in, arcs enter from the outside and exit to the inside.
            // When zooming out, arcs enter from the inside and exit to the outside.
            var enterArc = root === p ? outsideArc : insideArc,
                exitArc = root === p ? insideArc : outsideArc;
        
            center.datum(root);
        
            d3.transition().duration(750).each(function() {
              path = path.data(partition.nodes(root).slice(1), function(d) { return d.key; });
        
              path.transition()
                  .attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); });
        
              path.enter().append("path")
                  .style("fill-opacity", 0)
                  .style("fill", function(d) { return d.fill; })
                  .on("click", zoomIn)
                  .each(function(d) { this._current = enterArc(d); })
                .transition()
                  .style("fill-opacity", 1)
                  .attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); });
        
              path.exit().transition()
                  .style("fill-opacity", 0)
                  .attrTween("d", function(d) { return arcTween.call(this, exitArc(d)); })
                  .remove();
            });
          }
        
        function key(d) {
          var k = [], p = d;
          while (p.depth) k.push(p.name), p = p.parent;
          return k.reverse().join(".");
        }
        
        function fill(d) {
          var p = d;
          while (p.depth > 1) p = p.parent;
          var c = d3.lab(hue(p.name));
          c.l = luminance(d.sum);
          return c;
        }
        
        function arcTween(b) {
          var i = d3.interpolate(this._current, b);
          this._current = i(0);
          return function(t) {
            return arc(i(t));
          };
        }
        
        function updateArc(d) {
          return {depth: d.depth, x: d.x, dx: d.dx};
        }
        
        d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");

    }    
    
    
    // Methods
    exports.drawPartition                    = drawPartition;

});