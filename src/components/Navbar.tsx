
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Book, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Book className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-serif font-bold text-novel-800">
                NovelVerse
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <form onSubmit={handleSearch} className="relative w-64">
              <Input
                type="text"
                placeholder="Search novels..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link
                    to="/"
                    className="text-novel-600 hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link
                      to="/novels/create"
                      className="text-novel-600 hover:text-primary transition-colors"
                    >
                      Create Novel
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            <div className="flex items-center gap-3 ml-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-novel-600 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {user?.username}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {
                      logout();
                      toast({
                        title: "Logout berhasil",
                        description: "Anda telah keluar dari sistem",
                      });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-2">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Input
              type="text"
              placeholder="Search novels..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <nav>
            <ul className="flex flex-col space-y-2">
              <li>
                <Link
                  to="/"
                  className="block py-2 text-novel-600 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link
                    to="/novels/create"
                    className="block py-2 text-novel-600 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Novel
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="text-sm text-novel-600 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user?.username}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    toast({
                      title: "Logout berhasil",
                      description: "Anda telah keluar dari sistem",
                    });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center gap-1 justify-center"
                asChild
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
