# INF-19: Infectious Network Framework - 2019
# Core simulation framework for disease spread in a growing, dynamic community

import networkx as nx
import matplotlib.pyplot as plt
import random
import matplotlib.animation as animation

# Parameters
INITIAL_NODES = 1000
MAX_NODES = 10000
NEW_NODES_PER_STEP = 100
INITIAL_INFECTED = 1
INFECTION_PROB = 0.03
RECOVERY_TIME = 20
VACCINATION_START = 60
VACCINATION_RATE = 0.01

# Node status
HEALTHY = "healthy"
INFECTED = "infected"
RECOVERED = "recovered"
VACCINATED = "vaccinated"

# Initialize graph
G = nx.watts_strogatz_graph(INITIAL_NODES, 4, 0.2)

# Node attributes
for node in G.nodes():
    G.nodes[node]["status"] = HEALTHY
    G.nodes[node]["days_infected"] = 0

# Infect initial set
initial_infected = random.sample(list(G.nodes), INITIAL_INFECTED)
for node in initial_infected:
    G.nodes[node]["status"] = INFECTED

# Visualization setup
fig, ax = plt.subplots()
pos = nx.spring_layout(G, seed=42, k=0.8)
colors = {
    HEALTHY: "green",
    INFECTED: "red",
    RECOVERED: "blue",
    VACCINATED: "gold"
}

step_counter = [0]  # use list for mutability inside closure

# Main simulation function
def update(frame):
    step = step_counter[0]
    step_counter[0] += 1
    ax.clear()

    # Add new people to the community
    current_n = G.number_of_nodes()
    if current_n < MAX_NODES:
        for _ in range(NEW_NODES_PER_STEP):
            new_id = max(G.nodes) + 1
            G.add_node(new_id, status=HEALTHY, days_infected=0)
            # Connect to 3-5 existing nodes
            connections = random.sample(list(G.nodes), random.randint(3, 5))
            for conn in connections:
                G.add_edge(new_id, conn)
    
    # Update positions for new nodes
    new_nodes = set(G.nodes) - set(pos.keys())
    if new_nodes:
        new_pos = nx.spring_layout(G.subgraph(new_nodes), seed=42, k=0.8)
        pos.update(new_pos)



    # Infection logic
    new_infections = []
    for node in G.nodes():
        if G.nodes[node]["status"] == INFECTED:
            G.nodes[node]["days_infected"] += 1
            for neighbor in G.neighbors(node):
                if G.nodes[neighbor]["status"] == HEALTHY:
                    if random.random() < INFECTION_PROB:
                        new_infections.append(neighbor)
            if G.nodes[node]["days_infected"] > RECOVERY_TIME:
                G.nodes[node]["status"] = RECOVERED

    for node in new_infections:
        G.nodes[node]["status"] = INFECTED

    # Vaccination phase
    if step > VACCINATION_START:
        candidates = [n for n in G.nodes if G.nodes[n]["status"] == HEALTHY]
        to_vaccinate = random.sample(candidates, int(len(candidates) * VACCINATION_RATE))
        for node in to_vaccinate:
            G.nodes[node]["status"] = VACCINATED

    # Draw network
    statuses = [G.nodes[n]["status"] for n in G.nodes()]
    color_map = [colors[status] for status in statuses]
    nx.draw(G, pos, node_color=color_map, edge_color="lightgray", width=0.5, alpha=0.5, with_labels=False, node_size=10, ax=ax)
    ax.set_title(f"INF-19 Simulation - Step {step}")

ani = animation.FuncAnimation(fig, update, frames=100, interval=300, repeat=False)
plt.show()
