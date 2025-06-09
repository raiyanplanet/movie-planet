// MovieList.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import axios from "axios";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Star,
  Calendar,
  Search,
  Film,
  TrendingUp,
  Clock,
  Eye,
  Users,
} from "lucide-react";
import SearchBar from "./SearchBar";
import LoadingSpinner from "./LoadingSpinner";
import logo from "../assets/logo.png";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
}

type MovieCategory = "popular" | "top_rated" | "upcoming" | "now_playing";

interface CategoryConfig {
  key: MovieCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  endpoint: string;
}

const MOVIE_CATEGORIES: CategoryConfig[] = [
  {
    key: "popular",
    label: "Popular",
    icon: TrendingUp,
    endpoint: "popular",
  },
  {
    key: "top_rated",
    label: "Top Rated",
    icon: Star,
    endpoint: "top_rated",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: Clock,
    endpoint: "upcoming",
  },
  {
    key: "now_playing",
    label: "Now Playing",
    icon: Eye,
    endpoint: "now_playing",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const movieCardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    z: 50,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.1,
    },
  },
};

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<MovieCategory>("popular");

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.95]);

  const fetchMovies = useCallback(
    async (query = "", category: MovieCategory = "popular") => {
      // Don't show loading if we already have movies (for better UX)
      if (movies.length === 0) {
        setLoading(true);
      }
      setError(null);

      try {
        // Add a minimum delay to prevent flickering
        const startTime = Date.now();

        const url = query
          ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
              query
            )}`
          : `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}`;

        const res = await axios.get(url);

        // Ensure minimum loading time to prevent flickering
        const elapsed = Date.now() - startTime;
        const minLoadTime = 500; // 500ms minimum

        if (elapsed < minLoadTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadTime - elapsed)
          );
        }

        if (res.data && res.data.results) {
          setMovies(res.data.results);
          setSearchQuery(query);
          if (!query) {
            setActiveCategory(category);
          }
        } else {
          setMovies([]);
          setError("No results found");
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.status_message || "Failed to fetch movies"
            : "An unexpected error occurred"
        );
        setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    [] // Remove movies dependency to prevent infinite loops
  );

  const handleCategoryChange = (category: MovieCategory) => {
    if (searchQuery) {
      setSearchQuery("");
    }
    fetchMovies("", category);
  };

  const handleSearch = (query: string) => {
    fetchMovies(query, activeCategory);
  };

  // Initial load effect
  useEffect(() => {
    fetchMovies("", activeCategory);
  }, []); // Only run on mount

  // Separate effect for category changes (excluding initial load)
  useEffect(() => {
    if (movies.length > 0) {
      // Only if we've already loaded movies initially
      fetchMovies("", activeCategory);
    }
  }, []); // Remove activeCategory dependency since we handle it manually

  const currentCategory = MOVIE_CATEGORIES.find(
    (cat) => cat.key === activeCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header Section */}
      <motion.div
        className="relative"
        style={{ opacity: headerOpacity, scale: headerScale }}>
        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-900/50 to-zinc-950/80"
          animate={{
            background: [
              "linear-gradient(to bottom right, rgba(30, 58, 138, 0.3), rgba(39, 39, 42, 0.5), rgba(24, 24, 27, 0.8))",
              "linear-gradient(to bottom right, rgba(37, 99, 235, 0.2), rgba(39, 39, 42, 0.6), rgba(24, 24, 27, 0.9))",
              "linear-gradient(to bottom right, rgba(30, 58, 138, 0.3), rgba(39, 39, 42, 0.5), rgba(24, 24, 27, 0.8))",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"
          animate={{
            background: [
              "radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1), transparent 50%)",
              "radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.1), transparent 50%)",
              "radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1), transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative px-4 py-8 max-w-7xl mx-auto">
          {/* Main Title */}
          <motion.div
            className="text-center mb-8"
            variants={headerVariants}
            initial="hidden"
            animate="visible">
            <motion.div
              className="flex items-center justify-center gap-3 mb-4"
              variants={itemVariants}>
              <motion.div
                className="p-2  rounded-lg "
                whileHover={{
                  scale: 1.1,
                  rotate: 10,
                  backgroundColor: "rgba(37, 99, 235, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}>
                <div className="rounded-lg group-hover:scale-105 transition-transform shadow-lg shadow-blue-600/25">
                  <img src={logo} width={100} alt="Movie Hub" />
                </div>
              </motion.div>
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-white"
                variants={itemVariants}>
                Movie
                <motion.span
                  className="text-blue-400"
                  animate={{
                    color: ["#60a5fa", "#3b82f6", "#2563eb", "#60a5fa"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}>
                  Hub
                </motion.span>
              </motion.h1>
            </motion.div>
            <motion.p
              className="text-zinc-400 text-lg max-w-2xl mx-auto"
              variants={itemVariants}>
              Discover and explore movies from around the world
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="mb-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible">
            <SearchBar onSearch={handleSearch} />
          </motion.div>

          {/* Category Filters */}
          <AnimatePresence>
            {!searchQuery && (
              <motion.div
                className="flex flex-wrap gap-2 justify-center mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout>
                {MOVIE_CATEGORIES.map((category, index) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.key;

                  return (
                    <motion.button
                      key={category.key}
                      onClick={() => handleCategoryChange(category.key)}
                      disabled={loading}
                      variants={itemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      whileHover={loading ? {} : "hover"}
                      whileTap={loading ? {} : { scale: 0.95 }}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border
                        ${loading ? "opacity-50 cursor-not-allowed" : ""}
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 border-blue-600"
                            : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white border-zinc-700/50"
                        }
                      `}
                      style={{
                        background: isActive
                          ? "rgb(37, 99, 235)"
                          : "rgba(39, 39, 42, 0.5)",
                      }}>
                      <motion.div
                        animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}>
                        <Icon className="w-4 h-4" />
                      </motion.div>
                      {category.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section Title */}
          <motion.div
            className="flex items-center justify-between mb-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            layout>
            <div className="flex items-center gap-3">
              {searchQuery ? (
                <>
                  <motion.div
                    className="p-2 bg-zinc-800/50 rounded-lg"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(63, 63, 70, 0.7)",
                    }}>
                    <Search className="w-5 h-5 text-zinc-400" />
                  </motion.div>
                  <div>
                    <motion.h2
                      className="text-2xl font-bold text-white"
                      layoutId="section-title">
                      Search Results
                    </motion.h2>
                    <motion.p
                      className="text-zinc-400 text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}>
                      Results for "{searchQuery}"
                    </motion.p>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    className="p-2 bg-zinc-800/50 rounded-lg"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(63, 63, 70, 0.7)",
                    }}>
                    {currentCategory && (
                      <currentCategory.icon className="w-5 h-5 text-blue-400" />
                    )}
                  </motion.div>
                  <div>
                    <motion.h2
                      className="text-2xl font-bold text-white"
                      layoutId="section-title">
                      {currentCategory?.label} Movies
                    </motion.h2>
                    <motion.p
                      className="text-zinc-400 text-sm"
                      key={movies.length}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}>
                      {loading
                        ? "Loading..."
                        : `${movies.length} movies available`}
                    </motion.p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Movies Grid */}
      <div className="px-4 pb-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              className="min-h-[400px] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="loading">
              <LoadingSpinner />
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key="error">
              <motion.div
                className="p-4 bg-red-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}>
                <Film className="w-10 h-10 text-red-400" />
              </motion.div>
              <motion.h3
                className="text-xl font-semibold text-red-300 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                Error Loading Movies
              </motion.h3>
              <motion.p
                className="text-zinc-400 max-w-md mx-auto mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}>
                {error}
              </motion.p>
              <motion.button
                onClick={() => fetchMovies(searchQuery, activeCategory)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                Try Again
              </motion.button>
            </motion.div>
          ) : movies.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key="empty"
              transition={{ duration: 0.5 }}>
              <motion.div
                className="p-4 bg-zinc-800/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}>
                <Film className="w-10 h-10 text-zinc-600" />
              </motion.div>
              <motion.h3
                className="text-xl font-semibold text-zinc-300 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                No movies found
              </motion.h3>
              <motion.p
                className="text-zinc-500 max-w-md mx-auto mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}>
                {searchQuery
                  ? "Try adjusting your search terms or browse different categories."
                  : "Unable to load movies at the moment. Please try again later."}
              </motion.p>
              {searchQuery && (
                <motion.button
                  onClick={() => handleSearch("")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  Clear Search
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key="movies-grid">
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  variants={movieCardVariants}
                  custom={index}
                  layout
                  layoutId={`movie-${movie.id}`}
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  style={{ transformStyle: "preserve-3d" }}>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-zinc-800/50 hover:border-blue-500/50 transition-all duration-300 block h-full">
                    {/* Movie Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-zinc-800">
                      <motion.img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "/placeholder.png"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />

                      {/* Hover Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Rating Badge */}
                      {movie.vote_average > 0 && (
                        <motion.div
                          className="absolute top-2 right-2 bg-zinc-900/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1"
                          initial={{ opacity: 0, scale: 0, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          whileHover={{ scale: 1.1 }}>
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.2,
                            }}>
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          </motion.div>
                          <span className="text-xs font-semibold text-white">
                            {movie.vote_average.toFixed(1)}
                          </span>
                        </motion.div>
                      )}

                      {/* Vote Count */}
                      {movie.vote_count > 0 && (
                        <motion.div
                          className="absolute top-2 left-2 bg-zinc-900/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1"
                          initial={{ opacity: 0, scale: 0, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                          whileHover={{ scale: 1.1 }}>
                          <Users className="w-3 h-3 text-zinc-400" />
                          <span className="text-xs text-zinc-300">
                            {movie.vote_count > 1000
                              ? `${(movie.vote_count / 1000).toFixed(1)}k`
                              : movie.vote_count}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <motion.div
                      className="p-3 space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}>
                      <motion.h3
                        className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors"
                        layoutId={`title-${movie.id}`}>
                        {movie.title}
                      </motion.h3>

                      {movie.release_date && (
                        <motion.div
                          className="flex items-center gap-1 text-zinc-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.6 }}>
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">
                            {new Date(movie.release_date).getFullYear()}
                          </span>
                        </motion.div>
                      )}

                      {movie.overview && (
                        <motion.p
                          className="text-zinc-400 text-xs leading-relaxed line-clamp-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.7 }}>
                          {movie.overview}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Hover Glow Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MovieList;
