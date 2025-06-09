// SearchBar.tsx
import React, { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { Search, X, Film, TrendingUp, Clock, User, Star } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "trending" | "movie" | "person" | "genre";
  year?: number;
  rating?: number;
  posterUrl?: string;
}

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
}

interface TMDBPerson {
  id: number;
  name: string;
  known_for_department: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search for movies, genres, actors...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // TMDB API configuration
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92"; // Small poster size for suggestions

  // Mock trending searches for when no query is entered
  const trendingSearches = [
    "Marvel",
    "Action",
    "Comedy",
    "Horror",
    "Sci-Fi",
    "Drama",
    "Thriller",
    "Animation",
    "Romance",
  ];

  // Popular genres from TMDB
  const popularGenres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "TV Movie",
    "Thriller",
    "War",
    "Western",
  ];

  // Fetch suggestions from TMDB API
  const fetchTMDBSuggestions = async (
    searchQuery: string
  ): Promise<SearchSuggestion[]> => {
    if (!TMDB_API_KEY || !searchQuery.trim()) return [];

    try {
      const suggestions: SearchSuggestion[] = [];

      // Search for movies
      const movieResponse = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&page=1`
      );

      if (movieResponse.ok) {
        const movieData = await movieResponse.json();
        const movies = movieData.results?.slice(0, 4) || [];

        movies.forEach((movie: TMDBMovie) => {
          suggestions.push({
            id: `movie-${movie.id}`,
            text: movie.title,
            type: "movie",
            year: movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : undefined,
            rating: movie.vote_average
              ? Math.round(movie.vote_average * 10) / 10
              : undefined,
            posterUrl: movie.poster_path
              ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
              : undefined,
          });
        });
      }

      // Search for people (actors, directors, etc.)
      const personResponse = await fetch(
        `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&page=1`
      );

      if (personResponse.ok) {
        const personData = await personResponse.json();
        const people = personData.results?.slice(0, 3) || [];

        people.forEach((person: TMDBPerson) => {
          suggestions.push({
            id: `person-${person.id}`,
            text: person.name,
            type: "person",
          });
        });
      }

      // Add matching genres
      const matchingGenres = popularGenres
        .filter(
          (genre) =>
            genre.toLowerCase().includes(searchQuery.toLowerCase()) &&
            genre.toLowerCase() !== searchQuery.toLowerCase()
        )
        .slice(0, 2);

      matchingGenres.forEach((genre, index) => {
        suggestions.push({
          id: `genre-${index}`,
          text: genre,
          type: "genre",
        });
      });

      return suggestions;
    } catch (error) {
      console.error("Error fetching TMDB suggestions:", error);
      return [];
    }
  };

  // Create debounced search function with API suggestions
  const debouncedSearch = useRef(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim()) {
        // Fetch API suggestions
        const suggestions = await fetchTMDBSuggestions(searchQuery);
        setApiSuggestions(suggestions);

        // Trigger main search
        onSearch(searchQuery.trim());

        // Add to recent searches
        setRecentSearches((prev) => {
          const trimmedQuery = searchQuery.trim();
          const filtered = prev.filter((item) => item !== trimmedQuery);
          return [trimmedQuery, ...filtered].slice(0, 5);
        });
      } else {
        setApiSuggestions([]);
        onSearch("");
      }
      setIsLoading(false);
    }, 500)
  ).current;

  // Handle input changes with loading state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.trim()) {
      setIsLoading(true);
      debouncedSearch(newQuery);
    } else {
      setIsLoading(false);
      setApiSuggestions([]);
      debouncedSearch.cancel();
      onSearch("");
    }
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    setQuery("");
    setIsLoading(false);
    setApiSuggestions([]);
    debouncedSearch.cancel();
    onSearch("");
    inputRef.current?.focus();
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setIsFocused(false);
    setIsLoading(false);
    debouncedSearch.cancel();

    // Immediately trigger search and update recent searches
    onSearch(suggestion);
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== suggestion);
      return [suggestion, ...filtered].slice(0, 5);
    });

    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        setShowSuggestions(false);
        setIsFocused(false);
        setIsLoading(false);
        debouncedSearch.cancel();

        const trimmedQuery = query.trim();
        onSearch(trimmedQuery);
        setRecentSearches((prev) => {
          const filtered = prev.filter((item) => item !== trimmedQuery);
          return [trimmedQuery, ...filtered].slice(0, 5);
        });

        inputRef.current?.blur();
      }
    }
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "recent":
        return <Clock className="w-4 h-4 text-slate-400" />;
      case "trending":
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case "movie":
        return <Film className="w-4 h-4 text-blue-400" />;
      case "person":
        return <User className="w-4 h-4 text-green-400" />;
      case "genre":
        return <Star className="w-4 h-4 text-yellow-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSuggestionLabel = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "movie":
        return "Movie";
      case "person":
        return "Person";
      case "genre":
        return "Genre";
      default:
        return "";
    }
  };

  // Combine API suggestions with recent searches for filtering
  const getFilteredSuggestions = (): SearchSuggestion[] => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase().trim();
    const suggestions: SearchSuggestion[] = [];

    // Add matching recent searches
    recentSearches.forEach((search) => {
      if (
        search.toLowerCase().includes(queryLower) &&
        search.toLowerCase() !== queryLower
      ) {
        suggestions.push({
          id: `recent-${search}`,
          text: search,
          type: "recent",
        });
      }
    });

    // Add API suggestions
    suggestions.push(...apiSuggestions);

    return suggestions.slice(0, 8);
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-2xl mx-auto z-10 ${className}`}>
      {/* Main Search Input */}
      <div
        className={`relative group transition-all duration-300 ${
          isFocused ? "transform scale-105" : "hover:scale-102"
        }`}>
        {/* Background with glassmorphism effect */}
        <div
          className={`absolute inset-0 bg-slate-800/40 backdrop-blur-md rounded-2xl border transition-all duration-300 ${
            isFocused
              ? "border-purple-500/50 shadow-lg shadow-purple-500/25"
              : "border-slate-600/30 group-hover:border-slate-500/50"
          }`}
        />

        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <Search
            className={`w-5 h-5 transition-colors duration-300 ${
              isFocused ? "text-purple-400" : "text-slate-400"
            }`}
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="relative z-10 w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-slate-400 rounded-2xl outline-none text-lg font-medium"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-1 rounded-full hover:bg-slate-700/50 transition-colors duration-200"
            aria-label="Clear search">
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 z-10">
            <div className="w-4 h-4 border-2 border-slate-600 border-t-purple-500 rounded-full animate-spin opacity-50" />
          </div>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-600/30 shadow-xl shadow-black/25 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">
                  {query ? "Search Suggestions" : "Discover Movies"}
                </h3>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="max-h-80 overflow-y-auto z-10">
              {query ? (
                // Show filtered suggestions when typing
                <div className="p-2">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 text-left group">
                        {/* Movie Poster or Icon */}
                        {suggestion.type === "movie" && suggestion.posterUrl ? (
                          <div className="flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-slate-700">
                            <img
                              src={suggestion.posterUrl}
                              alt={`${suggestion.text} poster`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                            <div className="hidden w-full h-full flex items-center justify-center">
                              <Film className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-10 h-14 rounded-lg bg-slate-700/50 flex items-center justify-center">
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 group-hover:text-white truncate">
                              {suggestion.text}
                            </span>
                            {suggestion.year && (
                              <span className="text-xs text-slate-500">
                                ({suggestion.year})
                              </span>
                            )}
                          </div>
                          {suggestion.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-slate-400">
                                {suggestion.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getSuggestionLabel(suggestion.type) && (
                            <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              {getSuggestionLabel(suggestion.type)}
                            </span>
                          )}
                          <Search className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))
                  ) : isLoading ? (
                    <div className="px-4 py-6 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-600 border-t-purple-500 rounded-full animate-spin opacity-50" />
                        Searching...
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-400">
                      No suggestions found
                    </div>
                  )}
                </div>
              ) : (
                // Show categories when not typing
                <div className="p-2 space-y-1">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Searches
                      </div>
                      {recentSearches.slice(0, 3).map((search, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 text-left group">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 group-hover:text-white">
                            {search}
                          </span>
                        </button>
                      ))}
                      <div className="h-px bg-slate-700/50 mx-4 my-2" />
                    </>
                  )}

                  {/* Trending Searches */}
                  <div className="px-4 py-2 text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    Trending Searches
                  </div>
                  {trendingSearches.slice(0, 6).map((search, index) => (
                    <button
                      key={`trending-${index}`}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 text-left group">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300 group-hover:text-white">
                        {search}
                      </span>
                      <div className="flex-1" />
                      <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Popular
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-700/50 bg-slate-900/50">
              <p className="text-xs text-slate-500 text-center">
                Press{" "}
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">
                  Escape
                </kbd>{" "}
                to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
