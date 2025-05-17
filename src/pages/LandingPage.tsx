import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0066CC] to-[#34C759]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] opacity-20"></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <Activity className="h-20 w-20 text-white/90 mb-8 float" />
          <h1 className="text-6xl md:text-7xl font-bold text-white text-center mb-6">
            Epidemic Simulator
          </h1>
          <p className="text-xl text-white/80 max-w-2xl text-center mb-12">
            Explore the dynamics of disease spread through an interactive
            network simulation
          </p>
          <button
            onClick={() => navigate("/simulation")}
            className="group backdrop-blur-md bg-white/20 hover:bg-white/30 px-8 py-4 rounded-full transition-all duration-300 flex items-center space-x-2 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl"
          >
            <span className="text-white text-lg font-medium">
              Start Simulation
            </span>
            <ArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 pb-24">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-white/90">
                <h3 className="text-xl font-semibold mb-2">Network Dynamics</h3>
                <p className="text-white/70">
                  Visualize disease spread patterns through interconnected
                  communities in real-time.
                </p>
              </div>
              <div className="text-white/90">
                <h3 className="text-xl font-semibold mb-2">
                  Interactive Controls
                </h3>
                <p className="text-white/70">
                  Fine-tune simulation parameters to explore different outbreak
                  scenarios.
                </p>
              </div>
              <div className="text-white/90">
                <h3 className="text-xl font-semibold mb-2">Data Analysis</h3>
                <p className="text-white/70">
                  Track infection rates, recoveries, and mortality rates with
                  detailed statistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
