/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	console.log("Loading Quantified Self");

	var TSCORE = require("tscore");

    require("d3");

    function draw(svg) {
        console.log("Drawing Quantified Self");
          
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = svg.attr("width") - margin.left - margin.right,
            height = svg.attr("height") - margin.top - margin.bottom;
            
        svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        
        var y = d3.scale.linear()
            .rangeRound([height, 0]);
        
        var color = d3.scale.ordinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2s"));
        
    //          var data = d3.csv.parse(TSCORE.PerspectiveManager.csvExport());            
          var data = d3.csv.parse(tmpData);    
              color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));
            
          data.forEach(function(d) {
            var y0 = 0;
            d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
            d.total = d.ages[d.ages.length - 1].y1;
          });
        
          data.sort(function(a, b) { return b.total - a.total; });
        
          x.domain(data.map(function(d) { return d.State; }));
          y.domain([0, d3.max(data, function(d) { return d.total; })]);
        
          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);
        
          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Population");
        
          var state = svg.selectAll(".state")
              .data(data)
            .enter().append("g")
              .attr("class", "g")
              .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });
        
          state.selectAll("rect")
              .data(function(d) { return d.ages; })
            .enter().append("rect")
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d.y1); })
              .attr("height", function(d) { return y(d.y0) - y(d.y1); })
              .style("fill", function(d) { return color(d.name); });
        
          var legend = svg.selectAll(".legend")
              .data(color.domain().slice().reverse())
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        
          legend.append("rect")
              .attr("x", width - 18)
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", color);
        
          legend.append("text")
              .attr("x", width - 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function(d) { return d; });

    }
    
    var tmpData =   "State,Under 5 Years,5 to 13 Years,14 to 17 Years,18 to 24 Years,25 to 44 Years,45 to 64 Years,65 Years and Over\n"+
                    "AL,310504,552339,259034,450818,1231572,1215966,641667\n"+
                    "AK,52083,85640,42153,74257,198724,183159,50277\n"+
                    "AZ,515910,828669,362642,601943,1804762,1523681,862573\n"+
                    "AR,202070,343207,157204,264160,754420,727124,407205\n"+
                    "CA,2704659,4499890,2159981,3853788,10604510,8819342,4114496\n"+
                    "CO,358280,587154,261701,466194,1464939,1290094,511094";



	// Methods
	exports.draw					= draw;
	
});