import React, { useState } from "react";
import { SimulationParams } from "../utils/types";
import { InfoIcon } from "lucide-react";

interface SimulationControlsProps {
  params: SimulationParams;
  onParamChange: (paramName: keyof SimulationParams, value: number) => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  params,
  onParamChange,
  simulationSpeed,
  onSpeedChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>("network");

  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    paramName: keyof SimulationParams
  ) => {
    const value = parseFloat(e.target.value);
    onParamChange(paramName, value);
  };

  const handleSpeedSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speedValue = 2100 - parseInt(e.target.value) * 20;
    onSpeedChange(speedValue);
  };

  const speedSliderValue = Math.round((2100 - simulationSpeed) / 20);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            Simulation Speed
          </label>
          <span className="text-xs text-gray-500">
            {(1000 / simulationSpeed).toFixed(1)} days/second
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={speedSliderValue}
          onChange={handleSpeedSliderChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          {["network", "disease", "simulation"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } py-2 px-1 text-sm font-medium border-b-2 transition-colors capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div
        className={`tab-content ${
          activeTab === "network" ? "block" : "hidden"
        }`}
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Number of Hubs
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Distinct communities in the network
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.numHubs}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={params.numHubs}
              onChange={(e) => handleSliderChange(e, "numHubs")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Nodes Per Hub
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Number of nodes in each community
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.nodesPerHub}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="70"
              step="1"
              value={params.nodesPerHub}
              onChange={(e) => handleSliderChange(e, "nodesPerHub")}
              className="w-full"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Hubless Nodes
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Initial Hubless Count
                  <div className="tooltip ml-1">
                    <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="tooltiptext">
                      Number of nodes not in any hub
                    </span>
                  </div>
                </label>
                <span className="text-xs font-medium text-gray-700">
                  {params.initialHublessCount}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={params.initialHublessCount}
                onChange={(e) => handleSliderChange(e, "initialHublessCount")}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Min Hubless Connections
                  <div className="tooltip ml-1">
                    <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="tooltiptext">
                      Minimum connections for hubless nodes
                    </span>
                  </div>
                </label>
                <span className="text-xs font-medium text-gray-700">
                  {params.minHublessConnections}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.minHublessConnections}
                onChange={(e) => handleSliderChange(e, "minHublessConnections")}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Number of Hubless Connections
                  <div className="tooltip ml-1">
                    <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="tooltiptext">
                      Number of connections for hubless nodes
                    </span>
                  </div>
                </label>
                <span className="text-xs font-medium text-gray-700">
                  {params.numHublessConnections}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.numHublessConnections}
                onChange={(e) => handleSliderChange(e, "numHublessConnections")}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Hubless Rewire Probability
                  <div className="tooltip ml-1">
                    <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="tooltiptext">
                      Chance of hubless nodes rewiring connections
                    </span>
                  </div>
                </label>
                <span className="text-xs font-medium text-gray-700">
                  {params.hublessRewireProbability.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={params.hublessRewireProbability}
                onChange={(e) =>
                  handleSliderChange(e, "hublessRewireProbability")
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Hub Connections
            </h3>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Min Intra-Hub Connections
                  <div className="tooltip ml-1">
                    <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="tooltiptext">
                      Minimum connections within same hub
                    </span>
                  </div>
                </label>
                <span className="text-xs font-medium text-gray-700">
                  {params.minIntraHubConnections}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.minIntraHubConnections}
                onChange={(e) =>
                  handleSliderChange(e, "minIntraHubConnections")
                }
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Number of Intra-Hub Connections
                  <div className="tooltip ml-1">
                    <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="tooltiptext">
                      Number of connections within same hub
                    </span>
                  </div>
                </label>
                <span className="text-xs font-medium text-gray-700">
                  {params.numIntraHubConnections}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.numIntraHubConnections}
                onChange={(e) =>
                  handleSliderChange(e, "numIntraHubConnections")
                }
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Number of Inter-Hub Connections
                  <div className="tooltip ml-1">
                    <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="tooltiptext">
                      Number of connections to other hubs
                    </span>
                  </div>
                </label>
                <span className="text-xs font-medium text-gray-700">
                  {params.numInterHubConnections}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.numInterHubConnections}
                onChange={(e) =>
                  handleSliderChange(e, "numInterHubConnections")
                }
                className="w-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Inter-Hub Link Strength
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Connection strength between hubs
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.interHubLinkStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={params.interHubLinkStrength}
              onChange={(e) => handleSliderChange(e, "interHubLinkStrength")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Intra-Hub Link Strength
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Connection strength within hubs
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.intraHubLinkStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={params.intraHubLinkStrength}
              onChange={(e) => handleSliderChange(e, "intraHubLinkStrength")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Inter-Hub Distance
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Distance between connected hubs
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.interHubLinkDistance}
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="200"
              step="10"
              value={params.interHubLinkDistance}
              onChange={(e) => handleSliderChange(e, "interHubLinkDistance")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Intra-Hub Distance
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Distance between nodes in same hub
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.intraHubLinkDistance}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={params.intraHubLinkDistance}
              onChange={(e) => handleSliderChange(e, "intraHubLinkDistance")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Hub Sample Size
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Nodes sampled from other hubs
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.hubSampleSize}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={params.hubSampleSize}
              onChange={(e) => handleSliderChange(e, "hubSampleSize")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Hub Switch Probability
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Chance of nodes switching hubs
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.hubSwitchProbability.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={params.hubSwitchProbability}
              onChange={(e) => handleSliderChange(e, "hubSwitchProbability")}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div
        className={`tab-content ${
          activeTab === "disease" ? "block" : "hidden"
        }`}
      >
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="text-sm font-medium text-amber-800 mb-1">
            <b>Note:</b> These settings require a manual restart.
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Transmission Probability
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Chance of infection when exposed
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.transmissionProb.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.25"
              step="0.001"
              value={params.transmissionProb}
              onChange={(e) => handleSliderChange(e, "transmissionProb")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Partial Infection Probability
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Chance of infecting immune individuals
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.partialInfectionProb.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.001"
              value={params.partialInfectionProb}
              onChange={(e) => handleSliderChange(e, "partialInfectionProb")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Death Probability
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Chance of dying when infected
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.deathProbability.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.001"
              value={params.deathProbability}
              onChange={(e) => handleSliderChange(e, "deathProbability")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Recovery Time (days)
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">Days until recovery</span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {(params.recoveryTime / 1000).toFixed(0)}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="1000"
              value={params.recoveryTime}
              onChange={(e) => handleSliderChange(e, "recoveryTime")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Growth Rate
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">New nodes per step</span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.growthRate}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={params.growthRate}
              onChange={(e) => handleSliderChange(e, "growthRate")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Vaccination Probability
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Chance of vaccination when available
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.vaccinationProbability.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.vaccinationProbability}
              onChange={(e) => handleSliderChange(e, "vaccinationProbability")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Vaccine Start Time (days)
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Days until vaccination becomes available
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {(params.vaccineStartTime / 1000).toFixed(0)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="10000"
              value={params.vaccineStartTime}
              onChange={(e) => handleSliderChange(e, "vaccineStartTime")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Immunity Duration (days)
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Days of immunity after recovery/vaccination
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {(params.immunityDuration / 1000).toFixed(0)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={params.immunityDuration}
              onChange={(e) => handleSliderChange(e, "immunityDuration")}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div
        className={`tab-content ${
          activeTab === "simulation" ? "block" : "hidden"
        }`}
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Node Size
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">Visual size of nodes</span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.nodeRadius}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={params.nodeRadius}
              onChange={(e) => handleSliderChange(e, "nodeRadius")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Charge Strength
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">Force pushing nodes apart</span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.chargeStrength}
              </span>
            </div>
            <input
              type="range"
              min="-500"
              max="-10"
              step="10"
              value={params.chargeStrength}
              onChange={(e) => handleSliderChange(e, "chargeStrength")}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Zoom Range
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">Min/max zoom levels</span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.zoomMin} - {params.zoomMax}
              </span>
            </div>
            <div className="flex space-x-2">
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={params.zoomMin}
                onChange={(e) => handleSliderChange(e, "zoomMin")}
                className="w-1/2"
              />
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={params.zoomMax}
                onChange={(e) => handleSliderChange(e, "zoomMax")}
                className="w-1/2"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Simulation Alpha
                <div className="tooltip ml-1">
                  <InfoIcon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="tooltiptext">
                    Force simulation energy level
                  </span>
                </div>
              </label>
              <span className="text-xs font-medium text-gray-700">
                {params.simulationAlpha.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={params.simulationAlpha}
              onChange={(e) => handleSliderChange(e, "simulationAlpha")}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
