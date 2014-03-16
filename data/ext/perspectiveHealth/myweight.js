/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";
	console.log("Loading Quantified Self");

	var TSCORE = require("tscore");

    require("d3");

// /media/z/TagSpaces/sandbox/demo/Weight/[20120113 WEI89.6kg 30.2% 48.9% 36.0% BON2.0kg].tsd,,0,20120113,WEI89.6kg,DA30.2%,DB48.9%,DC36.0%,BON2.0kg

    function getData2() { 
        // Other posibility - d3.csv.parse(TSCORE.exportFileListCSV(TSCORE.fileList)); // requers unsafe-eval in the chrome manifest
        var rawData =  TSCORE.exportFileListArray(TSCORE.fileList); 
        var parsedData = [];
        rawData.forEach(function(d) {
            parsedData.push({
                "Date":         d.tag0,
                "Weight in kg": +extractTagInfo(d.tag1).data,
                "Fat in %":     +extractTagInfo(d.tag2).data,
                "Watter in %":  +extractTagInfo(d.tag3).data,
                "Muscles in %": +extractTagInfo(d.tag4).data,
                "Bones in kg":  +extractTagInfo(d.tag5).data,
            });            
        })
        return parsedData;            
    }

    function getData() { 
        // Other posibility - d3.csv.parse(TSCORE.exportFileListCSV(TSCORE.fileList)); // requers unsafe-eval in the chrome manifest
        var rawData =  TSCORE.exportFileListArray(TSCORE.fileList); 
        var parsedData = [];
        rawData.forEach(function(d) {
            parsedData.push({
                "date":   d.tag0,
                "weight": +extractTagInfo(d.tag1).data,
                "fat":     +extractTagInfo(d.tag2).data,
                "watter":     +extractTagInfo(d.tag3).data,
                "muscles":     +extractTagInfo(d.tag4).data,
                "bones":  +extractTagInfo(d.tag5).data,
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

    function draw2(svg) {
        console.log("Drawing My Weight");
          
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = svg.attr("width") - margin.left - margin.right,
            height = svg.attr("height") - margin.top - margin.bottom;
            
        svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
        var parseDate = d3.time.format("%Y%m%d").parse,
            formatYear = d3.format("02d"),
            formatDate = function(d) { return "Q" + ((d.getMonth() / 3 | 0) + 1) + formatYear(d.getFullYear() % 100); };
        
        var y0 = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .2);
        
        var y1 = d3.scale.linear();
        
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1, 0);
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(formatDate);
        
        var nest = d3.nest()
            .key(function(d) { return d.group; });
        
        var stack = d3.layout.stack()
            .values(function(d) { return d.values; })
            .x(function(d) { return d.date; })
            .y(function(d) { return d.value; })
            .out(function(d, y0) { d.valueOffset = y0; });
        
        var color = d3.scale.category10();
        

      var data = getData(); 

      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
      });
    
      var dataByGroup = nest.entries(data);
    
      stack(dataByGroup);
      x.domain(dataByGroup[0].values.map(function(d) { return d.date; }));
      y0.domain(dataByGroup.map(function(d) { return d.key; }));
      y1.domain([0, d3.max(data, function(d) { return d.value; })]).range([y0.rangeBand(), 0]);
    
      var group = svg.selectAll(".group")
          .data(dataByGroup)
        .enter().append("g")
          .attr("class", "group")
          .attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
    
      group.append("text")
          .attr("class", "group-label")
          .attr("x", -6)
          .attr("y", function(d) { return y1(d.values[0].value / 2); })
          .attr("dy", ".35em")
          .text(function(d) { return "Group " + d.key; });
    
      group.selectAll("rect")
          .data(function(d) { return d.values; })
        .enter().append("rect")
          .style("fill", function(d) { return color(d.group); })
          .attr("x", function(d) { return x(d.date); })
          .attr("y", function(d) { return y1(d.value); })
          .attr("width", x.rangeBand())
          .attr("height", function(d) { return y0.rangeBand() - y1(d.value); });
    
      group.filter(function(d, i) { return !i; }).append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + y0.rangeBand() + ")")
          .call(xAxis);
    
      d3.selectAll("input").on("change", change);
    
      var timeout = setTimeout(function() {
        d3.select("input[value=\"stacked\"]").property("checked", true).each(change);
      }, 2000);
    
      function change() {
        clearTimeout(timeout);
        if (this.value === "multiples") transitionMultiples();
        else transitionStacked();
      }
    
      function transitionMultiples() {
        var t = svg.transition().duration(750),
            g = t.selectAll(".group").attr("transform", function(d) { return "translate(0," + y0(d.key) + ")"; });
        g.selectAll("rect").attr("y", function(d) { return y1(d.value); });
        g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2); })
      }
    
      function transitionStacked() {
        var t = svg.transition().duration(750),
            g = t.selectAll(".group").attr("transform", "translate(0," + y0(y0.domain()[0]) + ")");
        g.selectAll("rect").attr("y", function(d) { return y1(d.value + d.valueOffset); });
        g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2 + d.values[0].valueOffset); })
      }

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