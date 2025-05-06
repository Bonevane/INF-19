import { SimulationNode, SimulationLink, SimulationParams } from './types';
import * as d3 from 'd3';

// Helper function to create hubs and initial network
export function createInitialNetwork(
  nodesRef: React.MutableRefObject<SimulationNode[]>, 
  linksRef: React.MutableRefObject<SimulationLink[]>,
  nextIdRef: React.MutableRefObject<number>,
  numHubs: number,
  nodesPerHub: number,
  initialHublessCount: number,
  minHublessConnections: number,
  numHublessConnections: number,
  minIntraHubConnections: number,
  numIntraHubConnections: number,
  numInterHubConnections: number,
  hubSampleSize: number,
  interHubLinkStrength: number,
  intraHubLinkStrength: number,
  interHubLinkDistance: number,
  intraHubLinkDistance: number
) {
  nodesRef.current = [];
  linksRef.current = [];
  const hubs: SimulationNode[][] = [];
  
  // Create hubs and assign nodes to them
  for (let i = 0; i < numHubs; i++) {
    const hub: SimulationNode[] = [];
    for (let j = 0; j < nodesPerHub; j++) {
      const node: SimulationNode = {
        id: nextIdRef.current++,
        status: "healthy",
        infectedAt: null,
        recoveredAt: null,
        vaccinatedAt: null,
        alive: true,
        currentHub: i,
        lastSwitchTime: Date.now(),
      };
      nodesRef.current.push(node);
      hub.push(node);
    }
    hubs.push(hub);
  }
  
  // Infect patient zero
  if (nodesRef.current.length > 0) {
    nodesRef.current[0].status = "infected";
    nodesRef.current[0].infectedAt = Date.now();
  }
  
  // Create hubless nodes
  for (let i = 0; i < initialHublessCount; i++) {
    const node: SimulationNode = {
      id: nextIdRef.current++,
      status: "healthy",
      infectedAt: null,
      recoveredAt: null,
      vaccinatedAt: null,
      alive: true,
      currentHub: null,
      lastSwitchTime: Date.now(),
    };
    nodesRef.current.push(node);
    
    const numConnections = Math.floor(Math.random() * numHublessConnections) + minHublessConnections;
    
    // Get random nodes from any hub
    const allNodes = d3.shuffle(nodesRef.current.filter(n => n !== node));
    const connections = allNodes.slice(0, numConnections);
    
    // Connect the hubless node to random nodes from any hub
    connections.forEach(targetNode => {
      linksRef.current.push({
        source: node,
        target: targetNode,
        strength: interHubLinkStrength,
        distance: interHubLinkDistance,
      });
    });
  }
  
  // Create intra-hub links
  hubs.forEach(hub => {
    hub.forEach(node1 => {
      const connections = d3.shuffle(hub.filter(n => n !== node1))
        .slice(0, minIntraHubConnections + Math.floor(Math.random() * numIntraHubConnections));
      
      connections.forEach(node2 => {
        linksRef.current.push({
          source: node1,
          target: node2,
          strength: intraHubLinkStrength,
          distance: intraHubLinkDistance,
          isPersistent: true,
        });
      });
    });
  });
  
  // Create inter-hub links
  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const hubA = hubs[i];
      const hubB = hubs[j];
      
      const samplesA = d3.shuffle(hubA).slice(0, hubSampleSize);
      const samplesB = d3.shuffle(hubB).slice(0, hubSampleSize);
      
      samplesA.forEach(nodeA => {
        samplesB.forEach(nodeB => {
          linksRef.current.push({
            source: nodeA,
            target: nodeB,
            strength: interHubLinkStrength,
            distance: interHubLinkDistance,
            isPersistent: true,
          });
        });
      });
    }
  }
}

// Disease spread logic
export function spreadInfection(
  nodesRef: React.MutableRefObject<SimulationNode[]>,
  linksRef: React.MutableRefObject<SimulationLink[]>,
  deathCountRef: React.MutableRefObject<number>,
  transmissionProb: number,
  deathProbability: number,
  recoveryTime: number,
  partialInfectionProb: number
) {
  const now = Date.now();
  const nodesToRemove: SimulationNode[] = [];
  
  nodesRef.current.forEach(n => {
    if (n.status === "infected") {
      // Death check
      if (Math.random() < deathProbability) {
        nodesToRemove.push(n);
        deathCountRef.current++;
        n.status = "dead";
        n.alive = false;
      } else if (n.infectedAt && now - n.infectedAt > recoveryTime) {
        n.status = "recovered";
        n.recoveredAt = now;
      }
    }
    
    if (n.status === "recovered" && n.recoveredAt && now - n.recoveredAt > recoveryTime * 3) {
      n.status = "healthy";
      n.recoveredAt = null;
    }
    
    if (n.status === "vaccinated" && n.vaccinatedAt && now - n.vaccinatedAt > recoveryTime * 3) {
      n.status = "healthy";
      n.vaccinatedAt = null;
    }
  });
  
  linksRef.current.forEach(l => {
    const source = typeof l.source === "object" ? l.source : nodesRef.current.find(n => n.id === l.source);
    const target = typeof l.target === "object" ? l.target : nodesRef.current.find(n => n.id === l.target);
    
    if (!source || !target) return;
    
    if (source.status === "infected" && target.status === "healthy") {
      if (Math.random() < transmissionProb) {
        target.status = "infected";
        target.infectedAt = now;
      }
    } else if (target.status === "infected" && source.status === "healthy") {
      if (Math.random() < transmissionProb) {
        source.status = "infected";
        source.infectedAt = now;
      }
    } else if (source.status === "infected" && (target.status === "vaccinated" || target.status === "recovered")) {
      if (Math.random() < partialInfectionProb) {
        target.status = "infected";
        target.infectedAt = now;
      }
    } else if (target.status === "infected" && (source.status === "vaccinated" || source.status === "recovered")) {
      if (Math.random() < partialInfectionProb) {
        source.status = "infected";
        source.infectedAt = now;
      }
    }
  });
  
  // Remove dead nodes
  nodesRef.current = nodesRef.current.filter(n => !nodesToRemove.includes(n));
  linksRef.current = linksRef.current.filter(
    l => {
      const source = typeof l.source === "object" ? l.source : nodesRef.current.find(n => n.id === l.source);
      const target = typeof l.target === "object" ? l.target : nodesRef.current.find(n => n.id === l.target);
      return !nodesToRemove.includes(source as SimulationNode) && !nodesToRemove.includes(target as SimulationNode);
    }
  );
}

// Hub switching logic
export function switchHubRoutine(
  nodesRef: React.MutableRefObject<SimulationNode[]>,
  linksRef: React.MutableRefObject<SimulationLink[]>,
  hublessRewireProbability: number,
  hubSwitchProbability: number,
  interHubLinkStrength: number,
  intraHubLinkStrength: number,
  interHubLinkDistance: number,
  intraHubLinkDistance: number
) {
  nodesRef.current.forEach(node => {
    const now = Date.now();
    
    // === 1. Hubless Node Rewiring ===
    if (node.currentHub == null && Math.random() < hublessRewireProbability) {
      const connectedLinks = linksRef.current.filter(
        link => 
          (typeof link.source === "object" && link.source.id === node.id) || 
          (typeof link.target === "object" && link.target.id === node.id)
      );
      
      if (connectedLinks.length > 0) {
        const oldLink = d3.shuffle(connectedLinks)[0];
        const oldNeighbor = 
          (typeof oldLink.source === "object" && oldLink.source.id === node.id) 
            ? (typeof oldLink.target === "object" ? oldLink.target : null)
            : (typeof oldLink.source === "object" ? oldLink.source : null);
        
        if (oldNeighbor) {
          // Remove old link
          const linkIndex = linksRef.current.indexOf(oldLink);
          if (linkIndex !== -1) {
            linksRef.current.splice(linkIndex, 1);
          }
          
          // Pick new target node not already connected
          const potentialTargets = nodesRef.current.filter(
            n => n.id !== node.id && !linksRef.current.some(
              link => 
                (typeof link.source === "object" && typeof link.target === "object") &&
                ((link.source.id === node.id && link.target.id === n.id) ||
                (link.source.id === n.id && link.target.id === node.id))
            )
          );
          
          if (potentialTargets.length > 0) {
            const newTarget = d3.shuffle(potentialTargets)[0];
            linksRef.current.push({
              source: node,
              target: newTarget,
              strength: interHubLinkStrength,
              distance: interHubLinkDistance,
            });
          }
        }
      }
    }
    
    // === 2. Hubbed Node Switching Hubs ===
    else if (node.currentHub != null && Math.random() < hubSwitchProbability) {
      const connectedLinks = linksRef.current.filter(
        link => 
          (typeof link.source === "object" && link.source.id === node.id) || 
          (typeof link.target === "object" && link.target.id === node.id)
      );
      
      const neighborsInOtherHubs = connectedLinks
        .map(link => {
          if (typeof link.source === "object" && link.source.id === node.id && typeof link.target === "object") {
            return link.target;
          } else if (typeof link.target === "object" && link.target.id === node.id && typeof link.source === "object") {
            return link.source;
          }
          return null;
        })
        .filter(n => n !== null && n.currentHub != null && n.currentHub !== node.currentHub) as SimulationNode[];
      
      if (neighborsInOtherHubs.length > 0) {
        const newHubNode = d3.shuffle(neighborsInOtherHubs)[0];
        const newHubId = newHubNode.currentHub;
        
        if (newHubId !== null) {
          // Determine how many connections to keep with old hub
          const oldHubId = node.currentHub;
          const oldHubNodes = nodesRef.current.filter(n => n.currentHub === oldHubId);
          const newHubNodes = nodesRef.current.filter(n => n.currentHub === newHubId);
          
          const oldLinks = linksRef.current.filter(
            l => {
              const source = typeof l.source === "object" ? l.source : null;
              const target = typeof l.target === "object" ? l.target : null;
              
              return (source && target) && (
                (source.id === node.id && oldHubNodes.some(n => n.id === target.id)) ||
                (target.id === node.id && oldHubNodes.some(n => n.id === source.id))
              );
            }
          );
          
          // Remove some old hub links
          const removeLinks = d3.shuffle(oldLinks).slice(0, Math.floor(oldLinks.length * 0.7));
          removeLinks.forEach(l => {
            const linkIndex = linksRef.current.indexOf(l);
            if (linkIndex !== -1) {
              linksRef.current.splice(linkIndex, 1);
            }
          });
          
          // Add links to new hub
          const potentialNewTargets = d3.shuffle(
            newHubNodes.filter(
              n => n.id !== node.id && !linksRef.current.some(
                link => 
                  (typeof link.source === "object" && typeof link.target === "object") &&
                  ((link.source.id === node.id && link.target.id === n.id) ||
                  (link.source.id === n.id && link.target.id === node.id))
              )
            )
          ).slice(0, removeLinks.length);
          
          potentialNewTargets.forEach(target => {
            linksRef.current.push({
              source: node,
              target,
              strength: intraHubLinkStrength,
              distance: intraHubLinkDistance,
              isPersistent: true,
            });
          });
          
          // Update remaining old hub links to be inter-hub links
          linksRef.current.forEach(l => {
            const source = typeof l.source === "object" ? l.source : null;
            const target = typeof l.target === "object" ? l.target : null;
            
            if (source && target) {
              if (
                (source.id === node.id || target.id === node.id) &&
                ((source.currentHub === newHubId && target.currentHub === oldHubId) ||
                (target.currentHub === newHubId && source.currentHub === oldHubId))
              ) {
                l.strength = interHubLinkStrength;
                l.distance = interHubLinkDistance;
              }
            }
          });
          
          node.currentHub = newHubId;
          node.lastSwitchTime = now;
        }
      }
    }
  });
}

// Grow community by adding new nodes
export function growCommunity(
  nodesRef: React.MutableRefObject<SimulationNode[]>,
  linksRef: React.MutableRefObject<SimulationLink[]>,
  nextIdRef: React.MutableRefObject<number>,
  params: SimulationParams
) {
  const count = params.growthRate;
  
  for (let i = 0; i < count; i++) {
    // 80% chance to add to a hub, 20% chance to be hubless
    const useHub = Math.random() < 0.8;
    
    if (useHub && params.numHubs > 0) {
      const assignedHub = Math.floor(Math.random() * params.numHubs);
      
      const newNode: SimulationNode = {
        id: nextIdRef.current++,
        status: "healthy",
        infectedAt: null,
        recoveredAt: null,
        vaccinatedAt: null,
        alive: true,
        currentHub: assignedHub,
        lastSwitchTime: Date.now(),
      };
      nodesRef.current.push(newNode);
      
      // Connect to random nodes in the same hub (intra-hub links)
      const hubMates = nodesRef.current.filter(
        n => n.currentHub === assignedHub && n.id !== newNode.id
      );
      
      const sameHubConnections = d3.shuffle(hubMates)
        .slice(0, params.minIntraHubConnections + Math.floor(Math.random() * params.numIntraHubConnections));
      
      sameHubConnections.forEach(target => {
        linksRef.current.push({
          source: newNode,
          target,
          strength: params.intraHubLinkStrength,
          distance: params.intraHubLinkDistance,
          isPersistent: true,
        });
      });
      
      // Connect to random nodes in other hubs (inter-hub links)
      const otherNodes = nodesRef.current.filter(
        n => n.currentHub !== assignedHub && n.currentHub !== null && n.id !== newNode.id
      );
      
      if (otherNodes.length > 0) {
        const interHubConnections = d3.shuffle(otherNodes)
          .slice(0, Math.min(params.numInterHubConnections, otherNodes.length));
        
        interHubConnections.forEach(target => {
          linksRef.current.push({
            source: newNode,
            target,
            strength: params.interHubLinkStrength,
            distance: params.interHubLinkDistance,
            isPersistent: true,
          });
        });
      }
    } else {
      // Create a hubless node
      const newNode: SimulationNode = {
        id: nextIdRef.current++,
        status: "healthy",
        infectedAt: null,
        recoveredAt: null,
        vaccinatedAt: null,
        alive: true,
        currentHub: null,
        lastSwitchTime: Date.now(),
      };
      nodesRef.current.push(newNode);
      
      // Connect to random nodes
      const numConnections = params.minHublessConnections + 
        Math.floor(Math.random() * (params.numHublessConnections - params.minHublessConnections + 1));
      
      const potentialConnections = d3.shuffle(
        nodesRef.current.filter(n => n.id !== newNode.id)
      ).slice(0, numConnections);
      
      potentialConnections.forEach(target => {
        linksRef.current.push({
          source: newNode,
          target,
          strength: params.interHubLinkStrength,
          distance: params.interHubLinkDistance,
        });
      });
    }
  }
}

// Vaccinate population
export function vaccinate(
  nodesRef: React.MutableRefObject<SimulationNode[]>,
  vaccinationProbability: number
) {
  nodesRef.current.forEach(n => {
    if (n.status === "healthy" && Math.random() < vaccinationProbability) {
      n.status = "vaccinated";
      n.vaccinatedAt = Date.now();
    }
  });
}