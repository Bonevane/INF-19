export interface SimulationParams {
  // HUBS
  numHubs: number;
  nodesPerHub: number;
  
  // HUBLESS NODES
  initialHublessCount: number;
  minHublessConnections: number;
  numHublessConnections: number;
  hublessRewireProbability: number;
  
  // HUBBED NODES
  minIntraHubConnections: number;
  numIntraHubConnections: number;
  numInterHubConnections: number;
  hubSwitchProbability: number;
  interHubLinkStrength: number;
  intraHubLinkStrength: number;
  interHubLinkDistance: number;
  intraHubLinkDistance: number;
  hubSampleSize: number;
  
  // DISEASE PARAMETERS
  growthRate: number;
  transmissionProb: number;
  deathProbability: number;
  partialInfectionProb: number;
  recoveryTime: number;
  vaccinationProbability: number;
  vaccineStartTime: number;
  immunityDuration: number;
  
  // SIMULATION PARAMETERS
  chargeStrength: number;
  nodeRadius: number;
  zoomMin: number;
  zoomMax: number;
  simulationAlpha: number;
  simulationInterval: number;
}

export interface SimulationStatistics {
  healthy: number;
  infected: number;
  recovered: number;
  vaccinated: number;
  dead: number;
  day: number;
  historyData: Array<{
    day: number;
    healthy: number;
    infected: number;
    recovered: number;
    vaccinated: number;
    dead: number;
  }>;
}

export interface SimulationNode {
  id: number;
  status: string;
  infectedAt: number | null;
  recoveredAt: number | null;
  vaccinatedAt: number | null;
  alive: boolean;
  currentHub: number | null;
  lastSwitchTime: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface SimulationLink {
  source: number | SimulationNode;
  target: number | SimulationNode;
  strength: number;
  distance: number;
  isPersistent?: boolean;
}