import { SimulationNode, SimulationLink, SimulationParams } from "./types";
import * as d3 from "d3";

// Initializing a new network
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

  // New hubs, with nodes assigned to them
  // (Very similar to a simplified Stochastic Block Model)
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

  // Initial infection (Only 1 atm but could be user provided)
  if (nodesRef.current.length > 0) {
    nodesRef.current[0].status = "infected";
    nodesRef.current[0].infectedAt = Date.now();
  }

  // Create hubless nodes (Somewhat like Erdős–Rényi?)
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

    const numConnections =
      Math.floor(Math.random() * numHublessConnections) + minHublessConnections;

    // Get random nodes from any hub
    const allNodes = d3.shuffle(nodesRef.current.filter((n) => n !== node));
    const connections = allNodes.slice(0, numConnections);

    // Connect the hubless node to random nodes from any hub
    connections.forEach((targetNode) => {
      linksRef.current.push({
        source: node,
        target: targetNode,
        strength: interHubLinkStrength,
        distance: interHubLinkDistance,
      });
    });
  }

  // Create intra-hub links
  hubs.forEach((hub) => {
    hub.forEach((node1) => {
      const connections = d3
        .shuffle(hub.filter((n) => n !== node1))
        .slice(
          0,
          minIntraHubConnections +
            numInterHubConnections -
            numIntraHubConnections +
            Math.floor(Math.random() * numIntraHubConnections)
        );

      connections.forEach((node2) => {
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

      samplesA.forEach((nodeA) => {
        samplesB.forEach((nodeB) => {
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

  nodesRef.current.forEach((n) => {
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
    } else if (
      n.status === "recovered" &&
      n.recoveredAt &&
      now - n.recoveredAt > recoveryTime * 3
    ) {
      n.status = "healthy";
      n.recoveredAt = null;
    } else if (
      n.status === "vaccinated" &&
      n.vaccinatedAt &&
      now - n.vaccinatedAt > recoveryTime * 3
    ) {
      n.status = "healthy";
      n.vaccinatedAt = null;
    }
  });

  linksRef.current.forEach((l) => {
    const source =
      typeof l.source === "object"
        ? l.source
        : nodesRef.current.find((n) => n.id === l.source);
    const target =
      typeof l.target === "object"
        ? l.target
        : nodesRef.current.find((n) => n.id === l.target);

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
    } else if (
      source.status === "infected" &&
      (target.status === "vaccinated" || target.status === "recovered")
    ) {
      if (Math.random() < partialInfectionProb) {
        target.status = "infected";
        target.infectedAt = now;
      }
    } else if (
      target.status === "infected" &&
      (source.status === "vaccinated" || source.status === "recovered")
    ) {
      if (Math.random() < partialInfectionProb) {
        source.status = "infected";
        source.infectedAt = now;
      }
    }
  });

  // Removing dead nodes
  nodesRef.current = nodesRef.current.filter((n) => !nodesToRemove.includes(n));
  linksRef.current = linksRef.current.filter((l) => {
    const source =
      typeof l.source === "object"
        ? l.source
        : nodesRef.current.find((n) => n.id === l.source);
    const target =
      typeof l.target === "object"
        ? l.target
        : nodesRef.current.find((n) => n.id === l.target);
    return (
      !nodesToRemove.includes(source as SimulationNode) &&
      !nodesToRemove.includes(target as SimulationNode)
    );
  });
}

// Hub switching logic
// (Simplified version of a Dynamic Small-World Network)
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
  // Adjacency map for O(1) connection lookups
  const connectionMap = new Map<number, Set<number>>();
  const nodeById = new Map<number, SimulationNode>();
  const nodesByHub = new Map<number | null, SimulationNode[]>();
  const now = Date.now();

  // Initializing the maps
  nodesRef.current.forEach((node) => {
    connectionMap.set(node.id, new Set());
    nodeById.set(node.id, node);

    // Group nodes by hub for faster filtering
    if (!nodesByHub.has(node.currentHub)) {
      nodesByHub.set(node.currentHub, []);
    }
    nodesByHub.get(node.currentHub)?.push(node);
  });

  // Populate connection map
  linksRef.current.forEach((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    connectionMap.get(sourceId)?.add(targetId);
    connectionMap.get(targetId)?.add(sourceId);
  });

  // Track changes to apply at the end
  const linksToRemove: SimulationLink[] = [];
  const linksToAdd: SimulationLink[] = [];
  const nodesToUpdate: Array<{
    node: SimulationNode;
    newHubId: number | null;
  }> = [];

  // Process nodes
  nodesRef.current.forEach((node) => {
    // === 1. Hubless Node Rewiring ===
    if (node.currentHub === null && Math.random() < hublessRewireProbability) {
      // Get node's connections
      const connections = connectionMap.get(node.id);

      if (connections && connections.size > 0) {
        // Select a random connection to remove
        const connectionIds = Array.from(connections);
        const randomConnectionId =
          connectionIds[Math.floor(Math.random() * connections.size)];
        const oldNeighbor = nodeById.get(randomConnectionId);

        if (oldNeighbor) {
          // Find the link to remove
          const oldLink = linksRef.current.find((link) => {
            const sourceId =
              typeof link.source === "object" ? link.source.id : link.source;
            const targetId =
              typeof link.target === "object" ? link.target.id : link.target;
            return (
              (sourceId === node.id && targetId === randomConnectionId) ||
              (sourceId === randomConnectionId && targetId === node.id)
            );
          });

          if (oldLink) {
            linksToRemove.push(oldLink);

            // Find nodes not currently connected to this node
            const potentialTargets = nodesRef.current.filter(
              (n) => n.id !== node.id && !connections.has(n.id)
            );

            if (potentialTargets.length > 0) {
              const newTarget =
                potentialTargets[
                  Math.floor(Math.random() * potentialTargets.length)
                ];

              linksToAdd.push({
                source: node,
                target: newTarget,
                strength: interHubLinkStrength,
                distance: interHubLinkDistance,
              });
            }
          }
        }
      }
    }

    // === 2. Hubbed Node Switching Hubs ===
    else if (node.currentHub !== null && Math.random() < hubSwitchProbability) {
      // Find neighbors in other hubs (using connection map)
      const connections = connectionMap.get(node.id);
      if (!connections) return;

      const neighborsInOtherHubs: SimulationNode[] = [];

      // This is much faster than filtering links
      connections.forEach((connectedId) => {
        const connectedNode = nodeById.get(connectedId);
        if (
          connectedNode &&
          connectedNode.currentHub !== null &&
          connectedNode.currentHub !== node.currentHub
        ) {
          neighborsInOtherHubs.push(connectedNode);
        }
      });

      if (neighborsInOtherHubs.length > 0) {
        const newHubNode =
          neighborsInOtherHubs[
            Math.floor(Math.random() * neighborsInOtherHubs.length)
          ];
        const newHubId = newHubNode.currentHub;

        if (newHubId !== null) {
          // Get current hub
          const oldHubId = node.currentHub;

          // Find nodes in old and new hub (using our map for faster access)
          const oldHubNodes = nodesByHub.get(oldHubId) || [];
          const newHubNodes = nodesByHub.get(newHubId) || [];

          // Find links to the old hub
          const oldLinks = linksRef.current.filter((l) => {
            const source = typeof l.source === "object" ? l.source : null;
            const target = typeof l.target === "object" ? l.target : null;

            return (
              source &&
              target &&
              ((source.id === node.id &&
                oldHubNodes.some((n) => n.id === target.id)) ||
                (target.id === node.id &&
                  oldHubNodes.some((n) => n.id === source.id)))
            );
          });

          // Remove some old hub links
          const removeLinks = oldLinks.slice(
            0,
            Math.floor(oldLinks.length * 0.7)
          );
          linksToRemove.push(...removeLinks);

          // Find potential new targets not already connected to this node
          const potentialNewTargets = newHubNodes.filter((n) => {
            return n.id !== node.id && !connections.has(n.id);
          });

          // Add links to new hub
          const newTargets = potentialNewTargets.slice(0, removeLinks.length);
          newTargets.forEach((target) => {
            linksToAdd.push({
              source: node,
              target,
              strength: intraHubLinkStrength,
              distance: intraHubLinkDistance,
              isPersistent: true,
            });
          });

          // Schedule node for hub update
          nodesToUpdate.push({ node, newHubId });
        }
      }
    }
  });

  // Apply all changes at once for better performance

  // Remove links
  linksToRemove.forEach((link) => {
    const index = linksRef.current.indexOf(link);
    if (index !== -1) {
      linksRef.current.splice(index, 1);
    }
  });

  // Add new links
  linksRef.current.push(...linksToAdd);

  // Update link strengths between hubs
  linksRef.current.forEach((l) => {
    const source = typeof l.source === "object" ? l.source : null;
    const target = typeof l.target === "object" ? l.target : null;

    // Update any links between the affected nodes' old and new hubs
    nodesToUpdate.forEach(({ node, newHubId }) => {
      const oldHubId = node.currentHub;
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
  });

  // Update node hub assignments
  nodesToUpdate.forEach(({ node, newHubId }) => {
    node.currentHub = newHubId;
    node.lastSwitchTime = now;
  });
}

// Growing the community by adding new nodes
export function growCommunity(
  nodesRef: React.MutableRefObject<SimulationNode[]>,
  linksRef: React.MutableRefObject<SimulationLink[]>,
  nextIdRef: React.MutableRefObject<number>,
  params: SimulationParams
) {
  const count = params.growthRate;

  for (let i = 0; i < count; i++) {
    // 60% chance to add to a hub, 40% chance to be hubless. Could be user provided.
    const useHub = Math.random() < 0.6;

    if (useHub && params.numHubs > 0) {
      const assignedHub = Math.floor(Math.random() * params.numHubs);

      // New (alive) hubbed node
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
        (n) => n.currentHub === assignedHub && n.id !== newNode.id
      );

      const sameHubConnections = d3
        .shuffle(hubMates)
        .slice(
          0,
          params.minIntraHubConnections +
            Math.floor(Math.random() * params.numIntraHubConnections)
        );

      sameHubConnections.forEach((target) => {
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
        (n) =>
          n.currentHub !== assignedHub &&
          n.currentHub !== null &&
          n.id !== newNode.id
      );

      if (otherNodes.length > 0) {
        const interHubConnections = d3
          .shuffle(otherNodes)
          .slice(0, Math.min(params.numInterHubConnections, otherNodes.length));

        interHubConnections.forEach((target) => {
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
      // Creating a hubless node
      const newNode: SimulationNode = {
        id: nextIdRef.current++,
        status: "healthy",
        infectedAt: null,
        recoveredAt: null,
        vaccinatedAt: null,
        alive: true, // Definitely alive
        currentHub: null,
        lastSwitchTime: Date.now(),
      };
      nodesRef.current.push(newNode);

      // Connecting to random nodes
      const numConnections =
        params.minHublessConnections +
        Math.floor(
          Math.random() *
            (params.numHublessConnections - params.minHublessConnections + 1)
        );

      const potentialConnections = d3
        .shuffle(nodesRef.current.filter((n) => n.id !== newNode.id))
        .slice(0, numConnections);

      potentialConnections.forEach((target) => {
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
  nodesRef.current.forEach((n) => {
    if (n.status === "healthy" && Math.random() < vaccinationProbability) {
      n.status = "vaccinated";
      n.vaccinatedAt = Date.now();
    }
  });
}
