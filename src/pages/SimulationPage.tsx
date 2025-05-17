import React, { useState } from "react";
import SimulationGraph from "../components/SimulationGraph";
import SimulationControls from "../components/SimulationControls";
import StatisticsDisplay from "../components/StatisticsDisplay";
import StatisticsGraph from "../components/StatisticsGraph";
import { defaultSimulationParams } from "../utils/constants";
import { SimulationParams, SimulationStatistics } from "../utils/types";

const SimulationPage: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(
    defaultSimulationParams
  );
  const [statistics, setStatistics] = useState<SimulationStatistics>({
    healthy: 0,
    infected: 1,
    recovered: 0,
    vaccinated: 0,
    dead: 0,
    day: 0,
    historyData: [],
  });
  const [isPaused, setIsPaused] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [key, setKey] = useState(0);

  const handleParamChange = (
    paramName: keyof SimulationParams,
    value: number
  ) => {
    setParams((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
  };

  const updateStatistics = (stats: SimulationStatistics) => {
    setStatistics(stats);
  };

  const resetSimulation = () => {
    setKey((prev) => prev + 1);
    setStatistics({
      healthy: 0,
      infected: 1,
      recovered: 0,
      vaccinated: 0,
      dead: 0,
      day: 0,
      historyData: [],
    });
    setIsPaused(false);
  };

  return (
    <div className="max-w-8xl mx-auto px-3 sm:px-4 py-4 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Disease Spread Simulation
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={togglePause}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isPaused
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="p-4">
              <SimulationGraph
                key={key}
                params={params}
                isPaused={isPaused}
                simulationSpeed={simulationSpeed}
                updateStatistics={updateStatistics}
              />
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Disease Progression
              </h2>
            </div>
            <div className="p-4">
              <StatisticsGraph statistics={statistics} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Current Statistics
              </h2>
            </div>
            <div className="p-4">
              <StatisticsDisplay statistics={statistics} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                Simulation Controls
              </h2>
            </div>
            <div className="p-4">
              <SimulationControls
                params={params}
                onParamChange={handleParamChange}
                simulationSpeed={simulationSpeed}
                onSpeedChange={handleSpeedChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
