const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let nodes = [],
  links = [],
  nextId = 0;

const transmissionProb = 0.2;
const deathProbability = 0.02;
const partialInfectionProb = 0.05;
const recoveryTime = 10000; // milliseconds
const vaccineStartTime = 100000;
const immunityDuration = 30000;
const simulationStartTime = Date.now();

let vaccinated = false;
let deathCount = 0;
let currentRecoveries = 0;

const deathCounts = []; // Array to track death count over time
const infectionCounts = []; // Array to track infection count over time
const recoveryCounts = []; // Array to track recovery count over time

function statusColor(status) {
  return (
    {
      healthy: "#66bb6a",
      infected: "#e53935",
      recovered: "#1e88e5",
      vaccinated: "#fdd835",
      dead: "#333333",
    }[status] || "#888"
  );
}

function createInitialNetwork() {
  for (let i = 0; i < 100; i++) {
    nodes.push({
      id: nextId++,
      status: "healthy",
      infectedAt: null,
      recoveredAt: null,
      vaccinatedAt: null,
      alive: true,
    });
  }

  for (let i = 0; i < 40; i++) {
    let a = nodes[Math.floor(Math.random() * nodes.length)];
    let b = nodes[Math.floor(Math.random() * nodes.length)];
    if (
      a !== b &&
      !links.some((l) => l.source.id === a.id && l.target.id === b.id)
    ) {
      links.push({ source: a, target: b });
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
      .distance(60)
  )
  .force("charge", d3.forceManyBody().strength(-100))
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
    .scaleExtent([0.1, 4]) // Zoom range (10% to 400%)
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
    .attr("r", 6)
    .merge(node)
    .attr("fill", (d) => statusColor(d.status));

  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(0.7).restart();

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
        currentRecoveries++; // Increment recovery count
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

  infectionCounts.push(currentInfections); // Add current infections to the array
  recoveryCounts.push(currentRecoveries); // Add current recoveries to the array
  deathCounts.push(deathCount); // Track death count

  // Remove dead nodes from node and link lists
  nodes = nodes.filter((n) => !nodesToRemove.includes(n));
  links = links.filter(
    (l) =>
      !nodesToRemove.includes(l.source) && !nodesToRemove.includes(l.target)
  );
}

function growCommunity(count = 3) {
  for (let i = 0; i < count; i++) {
    const newNode = { id: nextId++, status: "healthy", infectedAt: null };
    nodes.push(newNode);

    // Connect to 2 existing random nodes
    for (let j = 0; j < 2; j++) {
      const other = nodes[Math.floor(Math.random() * (nodes.length - 1))];
      links.push({ source: newNode, target: other });
    }
  }
}

function vaccinate() {
  if (!vaccinated && Date.now() - simulationStartTime > vaccineStartTime) {
    vaccinated = true;
    nodes.forEach((n) => {
      if (n.status === "healthy" && Math.random() < 0.4) {
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
  growCommunity(5);
  spreadInfection();
  vaccinate();
  updateGraph();
  updateGraphTimeSeries();
}

setInterval(step, 500);
updateGraph();
