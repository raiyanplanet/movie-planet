// SearchBar.tsx
import React, { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { Search, X, Film, TrendingUp, Clock } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "trending" | "suggestion";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock trending searches and suggestions
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

  // Create debounced search function with loading state
  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      setIsLoading(false);
      if (searchQuery.trim()) {
        onSearch(searchQuery.trim());
        // Add to recent searches only after actual search
        setRecentSearches((prev) => {
          const trimmedQuery = searchQuery.trim();
          const filtered = prev.filter((item) => item !== trimmedQuery);
          return [trimmedQuery, ...filtered].slice(0, 5);
        });
      }
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
      debouncedSearch.cancel();
      onSearch(""); // Clear search results when query is empty
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
      debouncedSearch.cancel(); // Cancel debounced function on unmount
    };
  }, [debouncedSearch]);

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    setQuery("");
    setIsLoading(false);
    debouncedSearch.cancel();
    onSearch(""); // Clear search results
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
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

        // Immediate search on Enter
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
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  // Generate filtered suggestions based on query
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

    // Add matching trending searches
    trendingSearches.forEach((search) => {
      if (
        search.toLowerCase().includes(queryLower) &&
        search.toLowerCase() !== queryLower
      ) {
        suggestions.push({
          id: `trending-${search}`,
          text: search,
          type: "trending",
        });
      }
    });

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
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-slate-300 group-hover:text-white flex-1">
                          {suggestion.text}
                        </span>
                        <Search className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))
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
