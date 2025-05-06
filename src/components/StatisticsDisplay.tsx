import React from 'react';
import { SimulationStatistics } from '../utils/types';
import { Calendar, Users, Activity, Heart, Frown, Stethoscope, Syringe } from 'lucide-react';

interface StatisticsDisplayProps {
  statistics: SimulationStatistics;
}

const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({ statistics }) => {
  const totalPopulation = 
    statistics.healthy + 
    statistics.infected + 
    statistics.recovered + 
    statistics.vaccinated + 
    statistics.dead;
    
  const formatPercent = (value: number) => {
    if (totalPopulation === 0) return '0%';
    return `${Math.round((value / totalPopulation) * 100)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Day</span>
        </div>
        <span className="text-lg font-semibold">{statistics.day}</span>
      </div>
      
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center">
          <Users className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Total Population</span>
        </div>
        <span className="text-lg font-semibold">{totalPopulation}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-green-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <Heart className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs font-medium text-gray-700">Healthy</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-semibold text-green-700">{statistics.healthy}</span>
            <span className="text-xs text-green-600">{formatPercent(statistics.healthy)}</span>
          </div>
        </div>
        
        <div className="card bg-red-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <Activity className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs font-medium text-gray-700">Infected</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-semibold text-red-700">{statistics.infected}</span>
            <span className="text-xs text-red-600">{formatPercent(statistics.infected)}</span>
          </div>
        </div>
        
        <div className="card bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <Stethoscope className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-xs font-medium text-gray-700">Recovered</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-semibold text-blue-700">{statistics.recovered}</span>
            <span className="text-xs text-blue-600">{formatPercent(statistics.recovered)}</span>
          </div>
        </div>
        
        <div className="card bg-yellow-50 p-3 rounded-lg">
          <div className="flex items-center mb-1">
            <Syringe className="h-4 w-4 text-yellow-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Vaccinated</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-semibold text-yellow-700">{statistics.vaccinated}</span>
            <span className="text-xs text-yellow-600">{formatPercent(statistics.vaccinated)}</span>
          </div>
        </div>
      </div>
      
      <div className="card bg-gray-100 p-3 rounded-lg">
        <div className="flex items-center mb-1">
          <Frown className="h-4 w-4 text-gray-700 mr-1" />
          <span className="text-xs font-medium text-gray-700">Deaths</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-semibold text-gray-800">{statistics.dead}</span>
          <span className="text-xs text-gray-600">{formatPercent(statistics.dead)}</span>
        </div>
      </div>
      
      {statistics.infected > 0 && statistics.day > 5 && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="text-sm font-medium text-amber-800 mb-1">Infection Rate</h3>
          <p className="text-xs text-amber-700">
            {statistics.historyData.length > 5 && (
              <>
                {(() => {
                  const rateOfChange = statistics.historyData.length >= 5 
                    ? (statistics.infected - statistics.historyData[statistics.historyData.length - 5].infected) / 5 
                    : 0;
                  
                  if (rateOfChange > 0) {
                    return `+${rateOfChange.toFixed(1)} cases/day`;
                  } else if (rateOfChange < 0) {
                    return `${rateOfChange.toFixed(1)} cases/day`;
                  } else {
                    return 'Stable';
                  }
                })()}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatisticsDisplay;