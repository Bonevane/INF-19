import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { SimulationParams, SimulationStatistics } from "../utils/types";
import {
  createInitialNetwork,
  spreadInfection,
  switchHubRoutine,
  growCommunity,
  vaccinate,
} from "../utils/simulationUtils";

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
  updateStatistics,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const nodesRef = useRef<any[]>([]);
  const linksRef = useRef<any[]>([]);
  const nextIdRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const simulationStartTimeRef = useRef<number>(Date.now());
  const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  // Statistics trackers
  const deathCountRef = useRef<number>(0);
  const dayCounterRef = useRef<number>(0);
  const statsHistoryRef = useRef<
    Array<{
      day: number;
      healthy: number;
      infected: number;
      recovered: number;
      vaccinated: number;
      dead: number;
    }>
  >([]);

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

  // Function to draw the network on canvas
  const drawCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;

    const ctx = contextRef.current;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Clear canvas
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

    // Apply zoom transform
    ctx.save();
    const t = zoomTransformRef.current;
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    // Draw links
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.6;

    linksRef.current.forEach((link) => {
      const source = link.source;
      const target = link.target;
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
    });
    ctx.stroke();

    // Draw nodes
    ctx.globalAlpha = 1;
    nodesRef.current.forEach((node) => {
      ctx.beginPath();
      ctx.fillStyle = statusColor(node.status);

      const radius = params.nodeRadius;

      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  // Function to handle canvas zoom
  const handleZoom = (event: any) => {
    zoomTransformRef.current = event.transform;
    // drawCanvas();
  };

  // Function to initialize or reset the simulation
  const initializeSimulation = () => {
    if (!canvasRef.current) return;

    // Get canvas context
    contextRef.current = canvasRef.current.getContext("2d");
    if (!contextRef.current) return;

    // Set pixel ratio for high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;
    canvasRef.current.width = canvasRef.current.clientWidth * pixelRatio;
    canvasRef.current.height = canvasRef.current.clientHeight * pixelRatio;
    contextRef.current.scale(pixelRatio, pixelRatio);

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    // Reset simulation state
    nodesRef.current = [];
    linksRef.current = [];
    nextIdRef.current = 0;
    deathCountRef.current = 0;
    dayCounterRef.current = 0;
    statsHistoryRef.current = [];
    simulationStartTimeRef.current = Date.now();
    zoomTransformRef.current = d3.zoomIdentity;

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

    // Set up zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([params.zoomMin, params.zoomMax])
      .on("zoom", handleZoom);

    d3.select(canvasRef.current).call(zoom as any);

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
      .alphaDecay(0.03)
      .alpha(0.08)
      .alphaMin(0.05)
      .velocityDecay(0.1)
      .on("tick", drawCanvas);

    simulationRef.current.tick(20);

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

  // Function to update the simulation when the data changes
  const updateGraph = () => {
    if (!simulationRef.current) return;

    // Apply the simulation
    simulationRef.current.nodes(nodesRef.current);
    simulationRef.current.force(
      "link",
      d3
        .forceLink(linksRef.current)
        .id((d: any) => d.id)
        .distance((d: any) => d.distance || 60)
        .strength((d: any) => d.strength || 0.1)
    );

    simulationRef.current.alpha(params.simulationAlpha).restart();
    // drawCanvas();
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

    // Hub Switching (Somewhat slow for >10k nodes)
    switchHubRoutine(
      nodesRef,
      linksRef,
      params.hublessRewireProbability,
      params.hubSwitchProbability,
      params.interHubLinkStrength,
      params.intraHubLinkStrength,
      params.interHubLinkDistance,
      params.intraHubLinkDistance
    );

    // Check if it's time to vaccinate
    if (Date.now() - simulationStartTimeRef.current > params.vaccineStartTime) {
      vaccinate(nodesRef, params.vaccinationProbability);
    }

    // Count statistics
    const stats = {
      healthy: nodesRef.current.filter((n) => n.status === "healthy").length,
      infected: nodesRef.current.filter((n) => n.status === "infected").length,
      recovered: nodesRef.current.filter((n) => n.status === "recovered")
        .length,
      vaccinated: nodesRef.current.filter((n) => n.status === "vaccinated")
        .length,
      dead: deathCountRef.current,
      day: dayCounterRef.current,
      historyData: [...statsHistoryRef.current],
    };

    // Add to history data
    statsHistoryRef.current.push({
      day: dayCounterRef.current,
      healthy: stats.healthy,
      infected: stats.infected,
      recovered: stats.recovered,
      vaccinated: stats.vaccinated,
      dead: stats.dead,
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
    params.nodeRadius,
  ]);

  return (
    <div className="w-full h-[32rem]">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-200 rounded"
        style={{ background: "#f9fafb" }}
      />
    </div>
  );
};

export default SimulationGraph;
