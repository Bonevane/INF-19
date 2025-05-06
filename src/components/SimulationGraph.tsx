import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SimulationParams, SimulationStatistics } from '../utils/types';
import { 
  createInitialNetwork, 
  spreadInfection, 
  switchHubRoutine, 
  growCommunity, 
  vaccinate 
} from '../utils/simulationUtils';

interface SimulationGraphProps {
  params: SimulationParams;
  isPaused: boolean;
  simulationSpeed: number;
  updateStatistics: (stats: SimulationStatistics) => void;
}

const SimulationGraph: React.FC<SimulationGraphProps> = ({ 
  params, 
  isPaused, 
  simulationSpeed,
  updateStatistics 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const nodesRef = useRef<any[]>([]);
  const linksRef = useRef<any[]>([]);
  const nextIdRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const simulationStartTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  
  // Statistics trackers
  const deathCountRef = useRef<number>(0);
  const dayCounterRef = useRef<number>(0);
  const statsHistoryRef = useRef<Array<{
    day: number;
    healthy: number;
    infected: number;
    recovered: number;
    vaccinated: number;
    dead: number;
  }>>([]);
  
  // Colors
  const healthyColor = "#66bb6a";
  const infectedColor = "#e53935";
  const recoveredColor = "#1e88e5";
  const vaccinatedColor = "#fdd835";
  const deadColor = "#333333";

  const statusColor = (status: string) => {
    return (
      {
        healthy: healthyColor,
        infected: infectedColor,
        recovered: recoveredColor,
        vaccinated: vaccinatedColor,
        dead: deadColor,
      }[status] || "#888"
    );
  };

  // Function to initialize or reset the simulation
  const initializeSimulation = () => {
    if (!svgRef.current) return;
    
    // Initialize the simulation
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Clear any existing SVG content
    svg.selectAll("*").remove();
    
    // Reset simulation state
    nodesRef.current = [];
    linksRef.current = [];
    nextIdRef.current = 0;
    deathCountRef.current = 0;
    dayCounterRef.current = 0;
    statsHistoryRef.current = [];
    simulationStartTimeRef.current = Date.now();
    
    // Create network
    createInitialNetwork(
      nodesRef, 
      linksRef, 
      nextIdRef,
      params.numHubs,
      params.nodesPerHub,
      params.initialHublessCount,
      params.minHublessConnections,
      params.numHublessConnections,
      params.minIntraHubConnections,
      params.numIntraHubConnections,
      params.numInterHubConnections,
      params.hubSampleSize,
      params.interHubLinkStrength,
      params.intraHubLinkStrength,
      params.interHubLinkDistance,
      params.intraHubLinkDistance
    );
    
    // Create SVG container with zoom capability
    containerRef.current = svg.append("g");
    
    svg.call(
      d3.zoom()
        .scaleExtent([params.zoomMin, params.zoomMax])
        .on("zoom", (event) => {
          containerRef.current?.attr("transform", event.transform);
        })
    );
    
    // Create links
    const link = containerRef.current
      .append("g")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(linksRef.current)
      .enter()
      .append("line")
      .attr("stroke-width", 1);
    
    // Create nodes
    const node = containerRef.current
      .append("g")
      .selectAll("circle")
      .data(nodesRef.current)
      .enter()
      .append("circle")
      .attr("r", params.nodeRadius)
      .attr("fill", d => statusColor(d.status))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(
        d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );
    
    // Initialize simulation
    simulationRef.current = d3
      .forceSimulation(nodesRef.current)
      .force(
        "link",
        d3
          .forceLink(linksRef.current)
          .id((d: any) => d.id)
          .distance((d: any) => d.distance || 60)
          .strength((d: any) => d.strength || 0.1)
      )
      .force("charge", d3.forceManyBody().strength(params.chargeStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);
        
        node
          .attr("cx", (d: any) => d.x)
          .attr("cy", (d: any) => d.y)
          .attr("fill", (d: any) => statusColor(d.status));
      });

    // Start the simulation timer
    startSimulationTimer();
  };

  // Function to start/restart the simulation timer
  const startSimulationTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(simulationStep, simulationSpeed);
  };

  // Function to update the D3 visualization when the data changes
  const updateGraph = () => {
    if (!containerRef.current) return;

    // Update links
    const linkSelection = containerRef.current
      .select("g")
      .selectAll("line")
      .data(linksRef.current);
    
    linkSelection.exit().remove();
    
    const linkEnter = linkSelection
      .enter()
      .append("line")
      .attr("stroke", "#ccc")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);
    
    // Update nodes
    const nodeSelection = containerRef.current
      .select("g:not(:first-child)")
      .selectAll("circle")
      .data(nodesRef.current, (d: any) => d.id);
    
    nodeSelection.exit().remove();
    
    const nodeEnter = nodeSelection
      .enter()
      .append("circle")
      .attr("r", params.nodeRadius)
      .attr("fill", (d: any) => statusColor(d.status))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(
        d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );
    
    // Apply the simulation
    simulationRef.current?.nodes(nodesRef.current);
    simulationRef.current?.force("link", d3.forceLink(linksRef.current)
      .id((d: any) => d.id)
      .distance((d: any) => d.distance || 60)
      .strength((d: any) => d.strength || 0.1)
    );
    
    simulationRef.current?.alpha(params.simulationAlpha).restart();
  };

  // Simulation step
  const simulationStep = () => {
    if (isPaused) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    // Increment day counter every simulationSpeed ms
    dayCounterRef.current++;
    
    // Grow community
    growCommunity(nodesRef, linksRef, nextIdRef, params);
    
    // Spread infection
    spreadInfection(
      nodesRef, 
      linksRef, 
      deathCountRef,
      params.transmissionProb,
      params.deathProbability,
      params.recoveryTime,
      params.partialInfectionProb
    );
    
    // Run network dynamics (hub switching)
    // switchHubRoutine(
    //   nodesRef,
    //   linksRef,
    //   params.hublessRewireProbability,
    //   params.hubSwitchProbability,
    //   params.interHubLinkStrength,
    //   params.intraHubLinkStrength,
    //   params.interHubLinkDistance,
    //   params.intraHubLinkDistance
    // );
    
    // Check if it's time to vaccinate
    if (Date.now() - simulationStartTimeRef.current > params.vaccineStartTime) {
      vaccinate(
        nodesRef,
        params.vaccinationProbability
      );
    }
    
    // Count statistics
    const stats = {
      healthy: nodesRef.current.filter(n => n.status === 'healthy').length,
      infected: nodesRef.current.filter(n => n.status === 'infected').length,
      recovered: nodesRef.current.filter(n => n.status === 'recovered').length,
      vaccinated: nodesRef.current.filter(n => n.status === 'vaccinated').length,
      dead: deathCountRef.current,
      day: dayCounterRef.current,
      historyData: [...statsHistoryRef.current]
    };
    
    // Add to history data
    statsHistoryRef.current.push({
      day: dayCounterRef.current,
      healthy: stats.healthy,
      infected: stats.infected,
      recovered: stats.recovered,
      vaccinated: stats.vaccinated,
      dead: stats.dead
    });
    
    // Keep history length manageable (last 100 days)
    if (statsHistoryRef.current.length > 100) {
      statsHistoryRef.current.shift();
    }
    
    // Update statistics in parent component
    updateStatistics(stats);
    
    // Update visualization
    updateGraph();
  };

  function dragstarted(event: any, d: any) {
    if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event: any, d: any) {
    if (!event.active) simulationRef.current?.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Initialize simulation on mount
  useEffect(() => {
    initializeSimulation();
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      startSimulationTimer();
    }
  }, [isPaused, simulationSpeed]);

  // Handle simulation speed changes
  useEffect(() => {
    if (!isPaused) {
      startSimulationTimer();
    }
  }, [simulationSpeed]);

  // Handle parameter changes
  useEffect(() => {
    if (simulationRef.current) {
      // Reset simulation with new parameters
      initializeSimulation();
    }
  }, [
    params.numHubs,
    params.nodesPerHub,
    params.initialHublessCount,
    params.minHublessConnections,
    params.numHublessConnections,
    params.minIntraHubConnections,
    params.numIntraHubConnections,
    params.numInterHubConnections,
    params.hubSampleSize,
    params.interHubLinkStrength,
    params.intraHubLinkStrength,
    params.interHubLinkDistance,
    params.intraHubLinkDistance,
    params.chargeStrength,
    params.simulationAlpha,
    params.zoomMin,
    params.zoomMax,
    params.nodeRadius
  ]);

  return (
    <div className="w-full h-[32rem]">
      <svg 
        ref={svgRef} 
        className="w-full h-full border border-gray-200 rounded"
        style={{ background: '#f9fafb' }}
      />
    </div>
  );
};

export default SimulationGraph;