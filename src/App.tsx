import { Routes, Route, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SimulationPage from "./pages/SimulationPage";
import AboutPage from "./pages/AboutPage";
import LandingPage from "./pages/LandingPage";
import "./App.css";

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Conditionally render headers */}
      {isLandingPage ? (
        <header className="fixed w-full z-50 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center backdrop-blur-md bg-white/20 px-4 py-2 rounded-full border border-white/20">
                <Link
                  to="/"
                  className=" text-2xl font-semibold text-white/90 bg-clip-text text-transparent"
                >
                  INF-19
                </Link>
              </div>
              <nav className="flex space-x-4">
                <Link
                  to="/simulation"
                  className="backdrop-blur-md bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border border-white/20 hover:border-white/40"
                >
                  Simulation
                </Link>
                <Link
                  to="/about"
                  className="backdrop-blur-md bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border border-white/20 hover:border-white/40"
                >
                  About
                </Link>
              </nav>
            </div>
          </div>
        </header>
      ) : (
        <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link
                to="/"
                className="ml-2 text-2xl font-semibold bg-gradient-to-r from-[#0066CC] to-[#34C759] bg-clip-text text-transparent"
              >
                INF-19
              </Link>
              <nav className="flex space-x-8">
                <Link
                  to="/simulation"
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
      )}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LandingPage />
                </motion.div>
              }
            />
            <Route
              path="/simulation"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SimulationPage />
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AboutPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      {isLandingPage ? (
        <footer></footer>
      ) : (
        <footer className="bg-white/70 backdrop-blur-md border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              Infectious Network Flow &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
