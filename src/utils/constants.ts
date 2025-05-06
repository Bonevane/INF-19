import { SimulationParams } from './types';

export const defaultSimulationParams: SimulationParams = {
  // HUBS
  numHubs: 8,
  nodesPerHub: 30,
  
  // HUBLESS NODES
  initialHublessCount: 200,
  minHublessConnections: 5,
  numHublessConnections: 5,
  hublessRewireProbability: 0.1,
  
  // HUBBED NODES
  minIntraHubConnections: 3,
  numIntraHubConnections: 3,
  numInterHubConnections: 3,
  hubSwitchProbability: 0.1,
  interHubLinkStrength: 0.05,
  intraHubLinkStrength: 0.9,
  interHubLinkDistance: 140,
  intraHubLinkDistance: 60,
  hubSampleSize: 2,
  
  // DISEASE PARAMETERS
  growthRate: 1,
  transmissionProb: 0.05,
  deathProbability: 0.02,
  partialInfectionProb: 0.05,
  recoveryTime: 10000,
  vaccinationProbability: 0.4,
  vaccineStartTime: 100000,
  immunityDuration: 30000,
  
  // SIMULATION PARAMETERS
  chargeStrength: -100,
  nodeRadius: 6,
  zoomMin: 0.1,
  zoomMax: 4,
  simulationAlpha: 0.7,
  simulationInterval: 1000
};

// NODE COLORS
export const healthyColor = "#66bb6a";
export const infectedColor = "#e53935";
export const recoveredColor = "#1e88e5";
export const vaccinatedColor = "#fdd835";
export const deadColor = "#333333";