const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let nodes = [],
  links = [],
  nextId = 0;

// HUBS
const numHubs = 8;
const nodesPerHub = 30;

// HUBLESS NODES
const initialHublessCount = 200; // Define how many hubless nodes you want initially
const minHublessConnections = 5; // Minimum connections for hubless nodes
const numHublessConnections = 5; // Number of connections for hubless nodes
const hublessRewireProbability = 0.1; // Chance a hubless node rewires

// HUBBED NODES
const minIntraHubConnections = 3;
const numIntraHubConnections = 3;
const numInterHubConnections = 3; // Number of connections for hubbed nodes
const hubSwitchProbability = 1; // Chance a hubbed node switches hubs
const interHubLinkStrength = 0.05; // Initial strength for inter-hub links
const intraHubLinkStrength = 0.9; // Initial strength for intra-hub links
const interHubLinkDistance = 140; // Initial distance for inter-hub links
const intraHubLinkDistance = 60; // Initial distance for intra-hub links
const hubSampleSize = 2; // Number of nodes to sample from other hubs

// DISEASE PARAMETERS
const growthRate = 1; // Number of new nodes to add each step
const transmissionProb = 0.05;
const deathProbability = 0.02;
const partialInfectionProb = 0.05;
const recoveryTime = 10000; // milliseconds
const vaccinationProbability = 0.4; // Probability of vaccination
const vaccineStartTime = 100000;
const immunityDuration = 30000;

// SIMULATION PARAMETERS
const chargeStrength = -100; // Adjusted charge strength
const nodeRadius = 6; // Adjusted node radius
const zoomMin = 0.1; // Minimum zoom level
const zoomMax = 4; // Maximum zoom level
const simulationAlpha = 0.7; // Simulation alpha value
const pauseSimulation = false; // Pause simulation flag
const simulationInterval = 1000; // Simulation step interval in milliseconds

// NODE COLORS
let healthyColor = "#66bb6a";
let infectedColor = "#e53935";
let recoveredColor = "#1e88e5";
let vaccinatedColor = "#fdd835";
let deadColor = "#333333";

let vaccinated = false;
let deathCount = 0;
let currentRecoveries = 0;

const simulationStartTime = Date.now();

const deathCounts = [];
const infectionCounts = [];
const recoveryCounts = [];

function statusColor(status) {
  return (
    {
      healthy: healthyColor,
      infected: infectedColor,
      recovered: recoveredColor,
      vaccinated: vaccinatedColor,
      dead: deadColor,
    }[status] || "#888"
  );
}

// Helper function to create hubs and initial network
function createInitialNetwork() {
  const hubs = [];

  // Create hubs and assign nodes to them
  for (let i = 0; i < numHubs; i++) {
    const hub = [];
    for (let j = 0; j < nodesPerHub; j++) {
      const node = {
        id: nextId++,
        status: "healthy",
        infectedAt: null,
        recoveredAt: null,
        vaccinatedAt: null,
        alive: true,
        currentHub: i, // Hub assignment
        lastSwitchTime: Date.now(),
      };
      nodes.push(node);
      hub.push(node);
    }
    hubs.push(hub);
  }

  for (let i = 0; i < initialHublessCount; i++) {
    const node = {
      id: nextId++,
      status: "healthy",
      infectedAt: null,
      recoveredAt: null,
      vaccinatedAt: null,
      alive: true,
      currentHub: null, // No initial hub
      lastSwitchTime: Date.now(),
    };
    nodes.push(node);

    const numConnections =
      Math.floor(Math.random() * numHublessConnections) + minHublessConnections;

    // Get random nodes from any hub
    const allNodes = d3.shuffle(nodes.filter((n) => n !== node)); // Exclude the node itself
    const connections = allNodes.slice(0, numConnections);

    // Connect the hubless node to random nodes from any hub
    connections.forEach((targetNode) => {
      links.push({
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
          minHublessConnections +
            Math.floor(Math.random() * numIntraHubConnections)
        ); // 3–5
      connections.forEach((node2) => {
        links.push({
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
      const samplesA = d3.shuffle(hubA).slice(0, hubSampleSize); // 3 random nodes from A
      const samplesB = d3.shuffle(hubB).slice(0, hubSampleSize); // 3 from B

      samplesA.forEach((nodeA) => {
        samplesB.forEach((nodeB) => {
          links.push({
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

  // Infect patient zero
  nodes[0].status = "infected";
  nodes[0].infectedAt = Date.now();
}

createInitialNetwork();

const simulation = d3
  .forceSimulation(nodes)
  .force(
    "link",
    d3
      .forceLink(links)
      .id((d) => d.id)
      .distance((d) => d.distance || 60)
      .strength((d) => d.strength || 0.1) // Adjusted strength here
  )
  .force("charge", d3.forceManyBody().strength(chargeStrength))
  .force("center", d3.forceCenter(width / 2, height / 2));

const container = svg.append("g");

let link = container.append("g").attr("stroke", "#ccc").selectAll("line");

let node = container
  .append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll("circle");

svg.call(
  d3
    .zoom()
    .scaleExtent([zoomMin, zoomMax]) // Zoom range (10% to 400%)
    .on("zoom", (event) => {
      container.attr("transform", event.transform);
    })
);

function updateGraph() {
  link = link.data(links);
  link.exit().remove();
  link = link.enter().append("line").merge(link);

  node = node.data(nodes, (d) => d.id);
  node.exit().remove();
  node = node
    .enter()
    .append("circle")
    .attr("r", nodeRadius)
    .merge(node)
    .attr("fill", (d) => statusColor(d.status));

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(simulationAlpha).restart();

  document.getElementById("deathCount").textContent = deathCount;
  document.getElementById("aliveCount").textContent = nodes.length;
}

function ticked() {
  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  node
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("fill", (d) => statusColor(d.status));
}

simulation.on("tick", ticked);

function spreadInfection() {
  const now = Date.now();
  const nodesToRemove = [];
  let currentInfections = 0;

  nodes.forEach((n) => {
    if (n.status === "infected") {
      currentInfections++;
      // Death check
      if (Math.random() < deathProbability) {
        nodesToRemove.push(n);
        deathCount++;
        n.status = "dead";
        n.alive = false;
      } else if (Date.now() - n.infectedAt > recoveryTime) {
        n.status = "recovered";
        n.recoveredAt = now;
        currentRecoveries++;
      }
    }

    if (
      n.status === "recovered" &&
      n.recoveredAt &&
      now - n.recoveredAt > immunityDuration
    ) {
      n.status = "healthy";
      n.recoveredAt = null;
    }

    if (
      n.status === "vaccinated" &&
      n.vaccinatedAt &&
      now - n.vaccinatedAt > immunityDuration
    ) {
      n.status = "healthy";
      n.vaccinatedAt = null;
    }
  });

  links.forEach((l) => {
    const source =
      typeof l.source === "object"
        ? l.source
        : nodes.find((n) => n.id === l.source);
    const target =
      typeof l.target === "object"
        ? l.target
        : nodes.find((n) => n.id === l.target);

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
    }
  });

  infectionCounts.push(currentInfections);
  recoveryCounts.push(currentRecoveries);
  deathCounts.push(deathCount);

  // Remove dead nodes
  nodes = nodes.filter((n) => !nodesToRemove.includes(n));
  links = links.filter(
    (l) =>
      !nodesToRemove.includes(l.source) && !nodesToRemove.includes(l.target)
  );
}

function switchHubRoutine() {
  nodes.forEach((node) => {
    const now = Date.now();

    // === 1. Hubless Node Rewiring ===
    if (node.currentHub == null && Math.random() < hublessRewireProbability) {
      const connectedLinks = links.filter(
        (link) => link.source === node || link.target === node
      );

      if (connectedLinks.length > 0) {
        const oldLink = d3.shuffle(connectedLinks)[0];
        const oldNeighbor =
          oldLink.source === node ? oldLink.target : oldLink.source;

        // Remove old link
        links.splice(links.indexOf(oldLink), 1);

        // Pick new target node not already connected
        const potentialTargets = nodes.filter(
          (n) =>
            n !== node &&
            !links.some(
              (link) =>
                (link.source === node && link.target === n) ||
                (link.source === n && link.target === node)
            )
        );

        if (potentialTargets.length > 0) {
          const newTarget = d3.shuffle(potentialTargets)[0];
          links.push({
            source: node,
            target: newTarget,
            strength: interHubLinkStrength,
            distance: interHubLinkDistance,
          });
        }
      }
    }

    // === 2. Hubbed Node Switching Hubs ===
    else if (node.currentHub != null && Math.random() < hubSwitchProbability) {
      const connectedLinks = links.filter(
        (link) => link.source === node || link.target === node
      );

      const neighborsInOtherHubs = connectedLinks
        .map((link) => (link.source === node ? link.target : link.source))
        .filter(
          (n) => n.currentHub != null && n.currentHub !== node.currentHub
        );

      if (neighborsInOtherHubs.length > 0) {
        const newHubNode = d3.shuffle(neighborsInOtherHubs)[0];
        const newHubId = newHubNode.currentHub;

        // Determine how many connections to keep with old hub
        const oldHubId = node.currentHub;
        const oldHubNodes = nodes.filter((n) => n.currentHub === oldHubId);
        const newHubNodes = nodes.filter((n) => n.currentHub === newHubId);

        const oldLinks = links.filter(
          (l) =>
            (l.source === node && oldHubNodes.includes(l.target)) ||
            (l.target === node && oldHubNodes.includes(l.source))
        );

        const newLinks = links.filter(
          (l) =>
            (l.source === node && newHubNodes.includes(l.target)) ||
            (l.target === node && newHubNodes.includes(l.source))
        );

        const keepCount = newLinks.length;
        const removeLinks = d3.shuffle(oldLinks).slice(0, oldLinks.length);
        removeLinks.forEach((l) => links.splice(links.indexOf(l), 1));

        // Add links to new hub (same number as old links)
        const potentialNewTargets = d3
          .shuffle(
            newHubNodes.filter(
              (n) =>
                n !== node &&
                !links.some(
                  (l) =>
                    (l.source === node && l.target === n) ||
                    (l.source === n && l.target === node)
                )
            )
          )
          .slice(0, oldLinks.length);

        potentialNewTargets.forEach((target) => {
          links.push({
            source: node,
            target,
            strength: intraHubLinkStrength,
            distance: intraHubLinkDistance,
            isPersistent: true,
          });
        });

        // Reclassify old hub links as inter-hub
        links.forEach((l) => {
          const source =
            typeof l.source === "object"
              ? l.source
              : nodes.find((n) => n.id === l.source);
          const target =
            typeof l.target === "object"
              ? l.target
              : nodes.find((n) => n.id === l.target);

          if (
            (source === node || target === node) &&
            ((source.currentHub === newHubId &&
              target.currentHub === oldHubId) ||
              (target.currentHub === newHubId &&
                source.currentHub === oldHubId))
          ) {
            l.strength = interHubLinkStrength;
            l.distance = interHubLinkDistance;
          }
        });

        node.currentHub = newHubId;
        node.lastSwitchTime = now;
      }
    }
  });
}

function growCommunity(count = 3) {
  for (let i = 0; i < count; i++) {
    const assignedHub = Math.floor(Math.random() * numHubs);

    const newNode = {
      id: nextId++,
      status: "healthy",
      infectedAt: null,
      recoveredAt: null,
      vaccinatedAt: null,
      alive: true,
      currentHub: assignedHub,
      lastSwitchTime: Date.now(),
    };
    nodes.push(newNode);

    // Connect to 2–4 random nodes in the same hub (intra-hub links)
    const hubMates = nodes.filter(
      (n) => n.currentHub === assignedHub && n !== newNode
    );
    const sameHubConnections = d3
      .shuffle(hubMates)
      .slice(
        0,
        minIntraHubConnections +
          Math.floor(Math.random() * numIntraHubConnections)
      );
    sameHubConnections.forEach((target) => {
      links.push({
        source: newNode,
        target,
        strength: intraHubLinkStrength,
        distance: intraHubLinkDistance,
        isPersistent: true,
      });
    });

    // Connect to 2 random nodes in *other* hubs (inter-hub links)
    const otherNodes = nodes.filter((n) => n.currentHub !== assignedHub);
    const interHubConnections = d3
      .shuffle(otherNodes)
      .slice(0, numInterHubConnections);
    interHubConnections.forEach((target) => {
      links.push({
        source: newNode,
        target,
        strength: interHubLinkStrength,
        distance: interHubLinkDistance,
        isPersistent: true,
      });
    });
  }
}

function vaccinate() {
  if (!vaccinated && Date.now() - simulationStartTime > vaccineStartTime) {
    vaccinated = true;
    nodes.forEach((n) => {
      if (n.status === "healthy" && Math.random() < vaccinationProbability) {
        n.status = "vaccinated";
        n.vaccinatedAt = Date.now();
      }
    });
  }
}

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const graphWidth = 800 - margin.left - margin.right;
const graphHeight = 300 - margin.top - margin.bottom;

const graphSvg = d3
  .select("#graph")
  .append("svg")
  .attr("width", graphWidth + margin.left + margin.right)
  .attr("height", graphHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xScale = d3.scaleLinear().range([0, graphWidth]);
const yScale = d3.scaleLinear().range([graphHeight, 0]);

const lineDeaths = d3
  .line()
  .x((d, i) => xScale(i))
  .y((d) => yScale(d));
const lineInfections = d3
  .line()
  .x((d, i) => xScale(i))
  .y((d) => yScale(d));

function updateGraphTimeSeries() {
  // Update scales
  xScale.domain([
    0,
    Math.max(deathCounts.length, infectionCounts.length, recoveryCounts.length),
  ]);
  yScale.domain([
    0,
    Math.max(
      d3.max(deathCounts),
      d3.max(infectionCounts),
      d3.max(recoveryCounts)
    ),
  ]);

  graphSvg
    .selectAll(".line-deaths")
    .data([deathCounts])
    .join("path")
    .attr("class", "line-deaths")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", lineDeaths);

  graphSvg
    .selectAll(".line-infections")
    .data([infectionCounts])
    .join("path")
    .attr("class", "line-infections")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("d", lineInfections);

  // Add the line for recoveries
  graphSvg
    .selectAll(".line-recoveries")
    .data([recoveryCounts])
    .join("path")
    .attr("class", "line-recoveries")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("d", lineInfections); // You can reuse lineInfections or create a new line for recoveries
}

function step() {
  if (!pauseSimulation) {
    growCommunity(growthRate);
    spreadInfection();
    vaccinate();
    // switchHubRoutine(); // Add routine switching logic
    updateGraph();
    updateGraphTimeSeries();
  }
}

setInterval(step, simulationInterval);
updateGraph();
