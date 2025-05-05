
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Genre } from "@/types";
import { fetchgenres, createNovel } from "@/services/novelService";
import { X, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CreateNovel = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedgenres, setSelectedgenres] = useState<string[]>([]);
  const [availablegenres, setAvailablegenres] = useState<Genre[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Akses ditolak",
        description: "Anda harus login untuk membuat novel baru",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    const loadgenres = async () => {
      try {
        const genres = await fetchgenres();
        setAvailablegenres(genres);
      } catch (error) {
        console.error("Error loading genres:", error);
      }
    };

    loadgenres();
  }, [isAuthenticated, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {
      title: !title.trim() ? "Title is required" : "",
      description: !description.trim() ? "Description is required" : "",
      imageUrl: !imageUrl.trim() ? "Image URL is required" : "",
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const novel = await createNovel({
        title,
        description,
        imageUrl,
        genres: selectedgenres,
      });
      
      navigate(`/novels/${novel.id}`);
    } catch (error) {
      console.error("Error creating novel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGenre = () => {
    if (newGenre.trim() && !selectedgenres.includes(newGenre.trim())) {
      setSelectedgenres([...selectedgenres, newGenre.trim()]);
      setNewGenre("");
    }
  };

  const handleRemoveGenre = (tag: string) => {
    setSelectedgenres(selectedgenres.filter(t => t !== tag));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-6">Create New Novel</h1>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter novel title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter novel description"
                  className={`min-h-[150px] ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Cover Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className={errors.imageUrl ? "border-red-500" : ""}
                />
                {errors.imageUrl && (
                  <p className="text-red-500 text-sm">{errors.imageUrl}</p>
                )}
                {imageUrl && (
                  <div className="mt-2 relative w-40 h-60 overflow-hidden rounded border">
                    <img
                      src={imageUrl}
                      alt="Novel cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1532012197267-da84d127e765";
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genres">Genres</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedgenres.map((tag) => (
                    <Badge key={tag} className="gap-1 pl-2">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(tag)}
                        className="ml-1 text-xs hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                {/* Available genres */}
                {availablegenres.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-novel-500 mb-2">Available Genres:</p>
                    <div className="flex flex-wrap gap-2">
                      {availablegenres.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className={`cursor-pointer ${
                            selectedgenres.includes(tag.name)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-novel-200"
                          }`}
                          onClick={() => {
                            if (selectedgenres.includes(tag.name)) {
                              handleRemoveGenre(tag.name);
                            } else {
                              setSelectedgenres([...selectedgenres, tag.name]);
                            }
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add new tag */}
                <div className="flex gap-2">
                  <Input
                    id="newGenre"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Add a new tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddGenre();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddGenre} size="icon" variant="outline">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Novel"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateNovel;
