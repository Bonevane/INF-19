# INF-19

An interactive Infectious Network Flow (IMF) web application that simulates disease spread through a network of communities, with configurable parameters for both the network structure and disease characteristics.

## Features

### Network Simulation
- Configurable community (hub) structure
- Adjustable number of hubs and nodes per hub
- Customizable connection patterns:
  - Intra-hub connections (within communities)
  - Inter-hub connections (between communities)
  - Hubless nodes with independent connections
- Dynamic network evolution with:
  - Hub switching
  - Connection rewiring
  - Community growth

### Disease Parameters
- Transmission probability
- Partial infection probability
- Death probability
- Recovery time
- Growth rate
- Vaccination system:
  - Vaccination probability
  - Vaccine start time
  - Immunity duration

### Visualization
- Interactive network graph
- Real-time disease progression tracking
- Community structure visualization
- Node state indicators (susceptible, infected, recovered, vaccinated)
- Zoom and pan controls

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation
1. Clone the repository
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Network Configuration
- Adjust the number of hubs and nodes per hub
- Configure connection strengths and distances
- Set up hubless node parameters
- Control network evolution probabilities

### Disease Parameters
- Set transmission and infection probabilities
- Configure recovery and death rates
- Adjust vaccination parameters
- Control disease growth rate

### Simulation Controls
- Start/Pause/Reset simulation
- Adjust simulation speed
- Modify visualization parameters
- Track disease progression

## Technologies Used
- React
- TypeScript
- D3.js
- Tailwind CSS
- Vite

## License
This project is licensed under the [MIT License](LICENSE).