import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DiseaseProgressionGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const xScaleRef = useRef<d3.ScaleLinear<number, number>>();
  const yScaleRef = useRef<d3.ScaleLinear<number, number>>();

  // Initialize the graph
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Clear any existing SVG content
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    // Add axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom / 2)
      .attr("text-anchor", "middle")
      .text("Day");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left / 2)
      .attr("text-anchor", "middle")
      .text("Count");

    // Store scales for later use
    xScaleRef.current = xScale;
    yScaleRef.current = yScale;
  }, []);

  return (
    <svg ref={svgRef} width="100%" height="300px"></svg>
  );
};

export default DiseaseProgressionGraph; 