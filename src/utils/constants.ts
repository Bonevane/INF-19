import { SimulationParams } from "./types";

export const defaultSimulationParams: SimulationParams = {
  // HUBS
  numHubs: 20,
  nodesPerHub: 30,

  // HUBLESS NODES
  initialHublessCount: 800,
  minHublessConnections: 5,
  numHublessConnections: 5,
  hublessRewireProbability: 0.05,

  // HUBBED NODES
  minIntraHubConnections: 3,
  numIntraHubConnections: 3,
  numInterHubConnections: 3,
  hubSwitchProbability: 0.005,
  interHubLinkStrength: 0.05,
  intraHubLinkStrength: 0.9,
  interHubLinkDistance: 140,
  intraHubLinkDistance: 60,
  hubSampleSize: 2,

  // DISEASE PARAMETERS
  growthRate: 3,
  transmissionProb: 0.02,
  deathProbability: 0.01,
  partialInfectionProb: 0.01,
  recoveryTime: 15000,
  vaccinationProbability: 0.3,
  vaccineStartTime: 50000,
  immunityDuration: 60000,

  // SIMULATION PARAMETERS
  chargeStrength: -100,
  nodeRadius: 6,
  zoomMin: 0.1,
  zoomMax: 4,
  simulationAlpha: 0.5,
  simulationInterval: 1000,
};

// NODE COLORS
export const healthyColor = "#66bb6a";
export const infectedColor = "#e53935";
export const recoveredColor = "#1e88e5";
export const vaccinatedColor = "#fdd835";
export const deadColor = "#333333";
