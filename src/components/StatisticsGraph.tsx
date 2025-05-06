import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SimulationStatistics } from '../utils/types';

interface StatisticsGraphProps {
  statistics: SimulationStatistics;
}

const StatisticsGraph: React.FC<StatisticsGraphProps> = ({ statistics }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    if (!svgRef.current || !statistics.historyData.length) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 80, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Clear SVG
    svg.selectAll("*").remove();
    
    // Append the graph group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const x = d3.scaleLinear()
      .domain([
        d3.min(statistics.historyData, d => d.day) || 0,
        d3.max(statistics.historyData, d => d.day) || 10
      ])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(statistics.historyData, d => 
        Math.max(d.healthy, d.infected, d.recovered, d.vaccinated, d.dead)
      ) || 100])
      .range([innerHeight, 0]);
    
    // Create lines for each metric
    const healthyLine = d3.line<any>()
      .x(d => x(d.day))
      .y(d => y(d.healthy))
      .curve(d3.curveMonotoneX);
    
    const infectedLine = d3.line<any>()
      .x(d => x(d.day))
      .y(d => y(d.infected))
      .curve(d3.curveMonotoneX);
    
    const recoveredLine = d3.line<any>()
      .x(d => x(d.day))
      .y(d => y(d.recovered))
      .curve(d3.curveMonotoneX);
    
    const vaccinatedLine = d3.line<any>()
      .x(d => x(d.day))
      .y(d => y(d.vaccinated))
      .curve(d3.curveMonotoneX);
    
    const deadLine = d3.line<any>()
      .x(d => x(d.day))
      .y(d => y(d.dead))
      .curve(d3.curveMonotoneX);
    
    // Add the X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .append("text")
      .attr("fill", "#000")
      .attr("x", innerWidth / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .text("Day");
    
    // Add the Y Axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .text("Count");
    
    // Add the lines
    g.append("path")
      .datum(statistics.historyData)
      .attr("fill", "none")
      .attr("stroke", "#66bb6a")
      .attr("stroke-width", 2)
      .attr("d", healthyLine);
    
    g.append("path")
      .datum(statistics.historyData)
      .attr("fill", "none")
      .attr("stroke", "#e53935")
      .attr("stroke-width", 2)
      .attr("d", infectedLine);
    
    g.append("path")
      .datum(statistics.historyData)
      .attr("fill", "none")
      .attr("stroke", "#1e88e5")
      .attr("stroke-width", 2)
      .attr("d", recoveredLine);
    
    g.append("path")
      .datum(statistics.historyData)
      .attr("fill", "none")
      .attr("stroke", "#fdd835")
      .attr("stroke-width", 2)
      .attr("d", vaccinatedLine);
    
    g.append("path")
      .datum(statistics.historyData)
      .attr("fill", "none")
      .attr("stroke", "#333333")
      .attr("stroke-width", 2)
      .attr("d", deadLine);
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
    
    const legendData = [
      { label: "Healthy", color: "#66bb6a" },
      { label: "Infected", color: "#e53935" },
      { label: "Recovered", color: "#1e88e5" },
      { label: "Vaccinated", color: "#fdd835" },
      { label: "Dead", color: "#333333" }
    ];
    
    legendData.forEach((d, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d.color);
      
      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 9)
        .attr("font-size", 10)
        .text(d.label);
    });
  }, [statistics]);
  
  return (
    <div className="w-full h-64">
      <svg 
        ref={svgRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default StatisticsGraph;