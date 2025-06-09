// MovieDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Play,
  Heart,
  Share2,
  Bookmark,
  Users,
  DollarSign,
  Globe,
  Award,
  Film,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  vote_average?: number;
  vote_count?: number;
  budget?: number;
  revenue?: number;
  production_countries?: { name: string }[];
  production_companies?: { name: string; logo_path?: string }[];
  tagline?: string;
  homepage?: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchMovieData = async () => {
      setLoading(true);
      try {
        // Fetch movie details
        const movieRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
        );
        setMovie(movieRes.data);

        // Fetch cast
        const creditsRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`
        );
        setCast(creditsRes.data.cast.slice(0, 8));

        // Fetch videos
        const videosRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
        );
        setVideos(
          videosRes.data.results
            .filter((v: Video) => v.type === "Trailer")
            .slice(0, 1)
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}>
          <LoadingSpinner />
        </motion.div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center">
          <Film className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
            Movie Not Found
          </h2>
          <p className="text-zinc-400 mb-6">
            Sorry, we couldn't find the movie you're looking for.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
              <ArrowLeft className="w-4 h-4" />
              Back to Movies
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Hero Section with Backdrop */}
      <div className="relative overflow-hidden">
        <AnimatePresence>
          {movie.backdrop_path && (
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 z-0">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-zinc-900/60"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/40"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <motion.div variants={itemVariants} className="relative z-10 px-6 py-8">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ x: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/80 backdrop-blur-md hover:bg-zinc-700/80 text-zinc-100 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-zinc-700/50">
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
        </motion.div>

        {/* Movie Info */}
        <motion.div
          variants={itemVariants}
          className="relative z-10 px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col xl:flex-row gap-12">
              {/* Poster */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="flex-shrink-0">
                <div className="relative group">
                  <motion.img
                    layoutId={`poster-${movie.id}`}
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "../../public/placeholder.png"
                    }
                    alt={movie.title}
                    className="w-80 mx-auto xl:mx-0 rounded-2xl shadow-2xl shadow-zinc-950/50 border border-zinc-800/50"
                  />

                  {/* Rating Badge */}
                  {movie.vote_average && movie.vote_average > 0 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 shadow-xl shadow-amber-500/25 border border-amber-400/30">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-white fill-current" />
                        <span className="text-white font-bold text-lg">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-amber-100 text-xs text-center mt-1">
                        {movie.vote_count?.toLocaleString()} votes
                      </div>
                    </motion.div>
                  )}

                  {/* Hover Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent rounded-2xl flex items-end justify-center pb-6 opacity-0 transition-opacity duration-300">
                    <motion.div
                      initial={{ y: 20 }}
                      whileHover={{ y: 0 }}
                      className="text-zinc-100 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">View Details</span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Details */}
              <div className="flex-1 space-y-8">
                {/* Title and Tagline */}
                <motion.div variants={itemVariants}>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-6xl font-black text-zinc-100 mb-4 leading-tight bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text ">
                    {movie.title}
                  </motion.h1>
                  {movie.tagline && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl text-blue-400 italic font-medium">
                      "{movie.tagline}"
                    </motion.p>
                  )}
                </motion.div>

                {/* Quick Info */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap gap-3 text-zinc-300">
                  {movie.release_date && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    </motion.div>
                  )}
                  {movie.runtime && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="font-medium">
                        {formatRuntime(movie.runtime)}
                      </span>
                    </motion.div>
                  )}
                  {movie.production_countries &&
                    movie.production_countries.length > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 bg-zinc-800/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">
                          {movie.production_countries[0].name}
                        </span>
                      </motion.div>
                    )}
                </motion.div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap gap-3">
                    {movie.genres.map((genre, index) => (
                      <motion.span
                        key={genre.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm text-zinc-100 text-sm rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                        {genre.name}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                {/* Overview */}
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-zinc-800/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 shadow-xl">
                  <h3 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <Film className="w-6 h-6 text-blue-400" />
                    Overview
                  </h3>
                  <p className="text-zinc-300 leading-relaxed text-lg">
                    {movie.overview}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap gap-4">
                  {videos.length > 0 && (
                    <motion.a
                      href={`https://www.youtube.com/watch?v=${videos[0].key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/25 border border-red-500/30">
                      <Play className="w-5 h-5" />
                      Watch Trailer
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  )}

                  <motion.button
                    onClick={() => setIsFavorite(!isFavorite)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg border ${
                      isFavorite
                        ? "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white hover:shadow-pink-500/25 border-pink-500/30"
                        : "bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-100 hover:shadow-zinc-500/25 border-zinc-600/50"
                    }`}>
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                    {isFavorite ? "Favorited" : "Add to Favorites"}
                  </motion.button>

                  <motion.button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-lg border ${
                      isBookmarked
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-blue-500/25 border-blue-500/30"
                        : "bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-100 hover:shadow-zinc-500/25 border-zinc-600/50"
                    }`}>
                    <Bookmark
                      className={`w-5 h-5 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                    {isBookmarked ? "Bookmarked" : "Add to Watchlist"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-100 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-zinc-500/25 border border-zinc-600/50">
                    <Share2 className="w-5 h-5" />
                    Share
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Details */}
      <motion.div
        variants={itemVariants}
        className="px-6 py-16 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Cast */}
          {cast.length > 0 && (
            <motion.section variants={itemVariants}>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-zinc-100 mb-8 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                Cast
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                {cast.map((actor, index) => (
                  <motion.div
                    key={actor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="text-center group cursor-pointer">
                    <div className="relative mb-4 overflow-hidden rounded-2xl">
                      <img
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                            : "../../public/placeholder.png"
                        }
                        alt={actor.name}
                        className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h4 className="font-semibold text-zinc-100 text-sm mb-1 group-hover:text-blue-400 transition-colors duration-300">
                      {actor.name}
                    </h4>
                    <p className="text-zinc-400 text-xs">{actor.character}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Production Info */}
          <motion.section
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-8">
            {/* Box Office */}
            {(movie.budget || movie.revenue) && (
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-zinc-800/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 shadow-xl">
                <h3 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  Box Office
                </h3>
                <div className="space-y-4">
                  {movie.budget && movie.budget > 0 && (
                    <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-xl">
                      <span className="text-zinc-400 font-medium">Budget:</span>
                      <span className="text-zinc-100 font-bold text-lg">
                        {formatCurrency(movie.budget)}
                      </span>
                    </div>
                  )}
                  {movie.revenue && movie.revenue > 0 && (
                    <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-xl">
                      <span className="text-zinc-400 font-medium">
                        Revenue:
                      </span>
                      <span className="text-green-400 font-bold text-lg">
                        {formatCurrency(movie.revenue)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Production Companies */}
            {movie.production_companies &&
              movie.production_companies.length > 0 && (
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-zinc-800/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300 shadow-xl">
                  <h3 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-purple-400" />
                    Production
                  </h3>
                  <div className="space-y-3">
                    {movie.production_companies
                      .slice(0, 4)
                      .map((company, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="text-zinc-300 p-3 bg-zinc-700/30 rounded-xl hover:bg-zinc-700/50 transition-colors duration-300">
                          {company.name}
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
          </motion.section>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MovieDetails;
