const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

let nodes = [],
  links = [],
  nextId = 0;

const transmissionProb = 0.2;
const deathProbability = 0.02;
const recoveryTime = 10000; // milliseconds
const vaccineStartTime = 10000;
const simulationStartTime = Date.now();
let vaccinated = false;
let deathCount = 0;

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

//   let link = svg.append("g").attr("stroke", "#ccc").selectAll("line");

// let node = svg
//   .append("g")
//   .attr("stroke", "#fff")
//   .attr("stroke-width", 1.5)
//   .selectAll("circle");

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

  nodes.forEach((n) => {
    if (n.status === "infected") {
      // Death check
      if (Math.random() < deathProbability) {
        nodesToRemove.push(n);
        deathCount++;
        n.status = "dead";
        n.alive = false;
      } else if (Date.now() - n.infectedAt > recoveryTime) {
        n.status = "recovered";
      }
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
    }
  });

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
      }
    });
  }
}

function step() {
  growCommunity(5);
  spreadInfection();
  vaccinate();
  updateGraph();
}

setInterval(step, 1000);
updateGraph();
