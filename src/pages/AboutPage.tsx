import React from "react";
import { ExternalLink } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            About This Simulation
          </h1>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              This application simulates the spread of infectious diseases
              through a network of individuals. It models how diseases can
              spread through interconnected communities (hubs) and demonstrates
              the effects of various interventions like vaccination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Network Structure
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The simulation uses a hub-based network structure where:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Individuals are organized into hub communities</li>
              <li>
                Connections exist both within hubs (intra-hub) and between
                different hubs (inter-hub)
              </li>
              <li>
                Some individuals can exist outside of hubs (hubless nodes)
              </li>
              <li>Individuals may switch between hubs over time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Disease States
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="font-medium">Healthy</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Individuals who have not contracted the disease and are
                  susceptible.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <h3 className="font-medium">Infected</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Individuals who have contracted the disease and can transmit
                  it to others.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <h3 className="font-medium">Recovered</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Individuals who have recovered from the disease and have
                  temporary immunity.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <h3 className="font-medium">Vaccinated</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Individuals who have been vaccinated and have temporary
                  protection.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 rounded-full bg-gray-800 mr-2"></div>
                  <h3 className="font-medium">Dead</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Individuals who have died from the disease and are removed
                  from the network.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Parameters
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The simulation offers a wide range of adjustable parameters:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>
                <span className="font-medium">Hub Structure:</span> Control the
                number of hubs and nodes per hub
              </li>
              <li>
                <span className="font-medium">Connection Patterns:</span> Modify
                how nodes connect within and between hubs
              </li>
              <li>
                <span className="font-medium">Disease Dynamics:</span> Adjust
                transmission probability, recovery time, and mortality rate
              </li>
              <li>
                <span className="font-medium">Interventions:</span> Set
                vaccination parameters to model public health responses
              </li>
              <li>
                <span className="font-medium">Network Dynamics:</span> Control
                node movement, network growth, and restructuring
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Methodology
            </h2>
            <p className="text-gray-600 leading-relaxed">
              This simulation implements a modified SIR (Susceptible, Infected,
              Recovered) model with additional states for vaccination and
              mortality. The network structure uses a force-directed graph
              visualization powered by D3.js, and the disease transmission
              follows probabilistic rules based on the network connections.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Resources
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Compartmental Models in Epidemiology{" "}
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://d3js.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  D3.js Data Visualization Library{" "}
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/Network_theory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Network Theory <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
