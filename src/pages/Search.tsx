
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import NovelCard from "@/components/NovelCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Novel, Genre } from "@/types";
import { fetchgenres, searchNovels } from "@/services/novelService";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const { isAuthenticated } = useAuth();
  
  const [query, setQuery] = useState(initialQuery);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [availablegenres, setAvailablegenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [genres, searchResults] = await Promise.all([
          fetchgenres(),
          searchNovels(initialQuery, selectedGenreIds, isAuthenticated),
        ]);
        
        setAvailablegenres(genres);
        setNovels(searchResults);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialQuery, selectedGenreIds]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ query });
  };

  const toggleGenre = (tagId: string) => {
    if (selectedGenreIds.includes(tagId)) {
      setSelectedGenreIds(selectedGenreIds.filter(id => id !== tagId));
    } else {
      setSelectedGenreIds([...selectedGenreIds, tagId]);
    }
  };

  const clearFilters = () => {
    setSelectedGenreIds([]);
    setQuery("");
    setSearchParams({});
  };

  return (
    <Layout
      title="Pencarian Novel"
      description="Temukan novel favorit Anda dengan mencari berdasarkan judul, deskripsi, atau tag.">
    
      <div className="pb-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Discover Novels
          </h1>
          <p className="text-novel-600 max-w-2xl mx-auto">
            Find your next great read by searching or browsing our collection of novels.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-novel-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title or description"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-novel-200" : ""}
              >
                <Filter size={18} />
              </Button>
            </div>
          </form>
        </div>

        {showFilters && (
          <div className="max-w-3xl mx-auto mb-8 bg-white p-6 rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filter by genres</h2>
              {selectedGenreIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-sm gap-1 text-novel-600 hover:text-novel-900"
                >
                  <X size={14} />
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availablegenres.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedGenreIds.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleGenre(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="mb-8" />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-novel-200 h-56 rounded-md mb-4"></div>
                <div className="bg-novel-200 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-novel-200 h-4 rounded mb-2"></div>
                <div className="bg-novel-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {novels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {novels.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-bold mb-2">No Novels Found</h2>
                <p className="text-novel-600 mb-6">
                  {query || selectedGenreIds.length > 0
                    ? "Try a different search term or remove some filters."
                    : "No novels have been added yet."}
                </p>
                {(query || selectedGenreIds.length > 0) && (
                  <Button onClick={clearFilters}>Clear Search & Filters</Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Search;
