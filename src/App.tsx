import { Routes, Route, Link } from 'react-router-dom';
import SimulationPage from './pages/SimulationPage';
import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link
                to="/"
                className="ml-2 text-2xl font-semibold bg-gradient-to-r from-[#0066CC] to-[#34C759] bg-clip-text text-transparent"
              >
                INF -19
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link
                to="/"
                className="group relative text-transparent bg-[#189397] bg-clip-text px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-transparent"
              >
                Simulation
                <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-gradient-to-r from-[#0066CC] to-[#34C759] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full"></span>
              </Link>
              <Link
                to="/about"
                className="group relative text-transparent bg-[#189397] bg-clip-text px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-transparent"
              >
                About
                <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-gradient-to-r from-[#0066CC] to-[#34C759] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full"></span>
              </Link>
            </nav>
          </div>
        </div>
      </header>



      
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<SimulationPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Infectious Network Flow &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;