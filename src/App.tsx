// App.tsx
import React from "react";
import { Routes, Route, Link, useLocation } from "react-router";
import { Film, Home, ArrowLeft, Github, Heart, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MovieList from "./components/MovieList";
import MovieDetails from "./components/MovieDetails";
import logo from "./assets/logo.png";

const App = () => {
  const location = useLocation();
  const isMovieDetails = location.pathname.startsWith("/movie/");

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Navigation Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg transition-transform shadow-lg shadow-blue-600/25">
                <img src={logo} width={50} alt="Movie Hub" />
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}>
                <motion.h1
                  className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors"
                  whileHover={{ scale: 1.05 }}>
                  Movie<span className="text-blue-400">Hub</span>
                </motion.h1>
                <p className="text-xs text-zinc-400 -mt-1">
                  Your Cinema Experience
                </p>
              </motion.div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {isMovieDetails ? (
                  <motion.div
                    key="back-button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}>
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-200 hover:text-white rounded-lg transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600/50">
                      <motion.div
                        whileHover={{ x: -3 }}
                        transition={{ type: "spring", stiffness: 400 }}>
                        <ArrowLeft className="w-4 h-4" />
                      </motion.div>
                      <span className="hidden sm:inline font-medium">
                        Back to Movies
                      </span>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="home-button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}>
                    <Link
                      to="/"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25">
                      <Home className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">Home</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* GitHub Link */}
              <motion.a
                href="https://github.com/raiyanplanet/movie-planet"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-zinc-800/50"
                aria-label="GitHub Repository"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}>
                <Github className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative">
        {/* Animated Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/3 to-transparent rounded-full blur-3xl"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Routes with AnimatePresence */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MovieList />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative mt-20 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="rounded-lg shadow-lg shadow-blue-600/25">
                <img src={logo} width={120} alt="Movie Hub" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">
                  Movie<span className="text-blue-400">Hub</span>
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your ultimate destination for discovering and exploring movies
                  from around the world.
                </p>
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-zinc-400 text-sm">
                {[
                  "Browse Popular Movies",
                  "Search & Filter",
                  "Detailed Movie Information",
                  "Real-time Data",
                ].map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2">
                    <motion.div
                      className="w-1 h-1 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Technology Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}>
              <h4 className="text-white font-semibold mb-4">Powered By</h4>
              <div className="space-y-3">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span>The Movie Database (TMDB)</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Github className="w-4 h-4 text-blue-400" />
                  <span>Open Source Technology</span>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-zinc-400 text-sm">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}>
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                  </motion.div>
                  <span>Made with passion for cinema</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-zinc-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-zinc-500 text-sm text-center md:text-left">
                <p>
                  &copy; 2024 MovieHub. All rights reserved.
                  <br className="md:hidden" />
                  <span className="md:ml-1">
                    Movie data provided by The Movie Database (TMDB).
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-zinc-500 text-sm">Connect with us</span>
                <div className="flex items-center gap-2">
                  <motion.a
                    href="https://github.com/raiyanplanet/movie-planet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-zinc-800/50"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}>
                    <Github className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

// Enhanced 404 Not Found Component with Framer Motion
const NotFound: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Error Animation Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-12 relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border border-zinc-800/50">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}>
              <Film className="w-20 h-20 text-zinc-600 mx-auto mb-6" />
            </motion.div>

            <motion.h1
              className="text-8xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}>
              404
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-bold text-white mb-4">
              Movie Not Found
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-zinc-400 text-lg leading-relaxed max-w-md mx-auto">
              Looks like this page went to the cinema and never came back. Let's
              get you back to discovering some amazing films!
            </motion.p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}>
            <Link
              to="/"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 font-medium">
              <motion.div
                whileHover={{ scale: 1.1, x: -2 }}
                transition={{ type: "spring", stiffness: 400 }}>
                <Home className="w-5 h-5" />
              </motion.div>
              Discover Movies
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}>
            <button
              onClick={() => window.history.back()}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-200 hover:text-white rounded-xl transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600/50 font-medium">
              <motion.div
                whileHover={{ scale: 1.1, x: -2 }}
                transition={{ type: "spring", stiffness: 400 }}>
                <ArrowLeft className="w-5 h-5" />
              </motion.div>
              Go Back
            </button>
          </motion.div>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          whileHover={{ scale: 1.02 }}
          className="mt-12 p-6 bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-800/30">
          <h3 className="text-white font-semibold mb-3">Need Help?</h3>
          <p className="text-zinc-400 text-sm">
            If you think this is an error, please check the URL or return to the
            homepage to continue browsing.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default App;
