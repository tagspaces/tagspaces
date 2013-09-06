/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	console.log("Loading Quantified Self");

	var TSCORE = require("tscore");

    require("d3");

// /media/z/TagSpaces/sandbox/demo/Weight/[20120113 WEI89.6kg 30.2% 48.9% 36.0% BON2.0kg].tsd,,0,20120113,WEI89.6kg,DA30.2%,DB48.9%,DC36.0%,BON2.0kg

    function getData() { 
        // Other posibility - d3.csv.parse(TSCORE.exportFileListCSV(TSCORE.fileList)); // requers unsafe-eval in the chrome manifest
        var rawData =  TSCORE.exportFileListArray(TSCORE.fileList); 
        var parsedData = [];
        rawData.forEach(function(d) {
            parsedData.push({
                "Date":   d.tag0,
                "Weight in kg": +extractTagInfo(d.tag1).data,
                "Fat in %":     +extractTagInfo(d.tag2).data,
                "Wather in %":     +extractTagInfo(d.tag3).data,
                "Muscles in %":     +extractTagInfo(d.tag4).data,
                "Bones in kg":  +extractTagInfo(d.tag5).data,
            });            
        })
        return parsedData;            
    }
    
    // Input DA30.3kg
    function extractTagInfo(input) {
        // TODO regex not ready
        var tagSplit = /[0-9]+/g;
        var prefix = "";
        var postfix = "";
        
        var tagSplitArr = (""+input).match(tagSplit);
        if(tagSplitArr != null && tagSplitArr.length > 0) {
            prefix = tagSplitArr[0];
            postfix = tagSplitArr[tagSplitArr.length-1];   
        }          
        
        var dataRE = /[+-]?\d+\.\d+/g;
        var data = 0;        
        var dataArr = (""+input).match(dataRE);
        if(dataArr != null && dataArr.length > 0) {
            data = parseFloat(dataArr[0]);   
        }          
        
        return { "prefix": prefix, "data": data, "postfix": postfix };
    }

    function draw(svg) {
        console.log("Drawing My Weight");
          
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
        
           
          var data = getData();    

          color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Date"; }));
            
          data.forEach(function(d) {
            var y0 = 0;
            d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
            d.total = d.ages[d.ages.length - 1].y1;
          });
          
          // Sorting by date    
          data.sort(function(a, b) { return a.Date - b.Date; });
        
          x.domain(data.map(function(d) { return d.Date; }));
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
              .text("Health Data");
        
          var state = svg.selectAll(".state")
              .data(data)
            .enter().append("g")
              .attr("class", "g")
              //.attr("transform", function(d) { return "translate(" + (d.x + d.dx / 2) + "," + (d.y + d.dy / 2) + ")rotate(90)"; })
              .attr("transform", function(d) { return "translate(" + x(d.Date) + ",0)"; });
        
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

	// Methods
	exports.draw					= draw;
	
});