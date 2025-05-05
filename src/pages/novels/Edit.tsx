
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Novel, Genre } from "@/types";
import {
  fetchgenres,
  fetchNovelById,
  updateNovel,
  deleteNovel,
} from "@/services/novelService";
import { X, Plus, AlertTriangle, Trash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditNovel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedgenres, setSelectedgenres] = useState<string[]>([]);
  const [availablegenres, setAvailablegenres] = useState<Genre[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
        description: "Anda harus login untuk mengedit novel",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    if (!id) return;

    const loadNovelAndgenres = async () => {
      try {
        const [novel, genres] = await Promise.all([
          fetchNovelById(id),
          fetchgenres(),
        ]);
        
        if (novel) {
          setTitle(novel.title);
          setDescription(novel.description);
          setImageUrl(novel.imageUrl);
          setSelectedgenres(novel.genres.map((tag) => tag.name));
        } else {
          navigate("/not-found", { replace: true });
          return;
        }
        
        setAvailablegenres(genres);
      } catch (error) {
        console.error("Error loading novel data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNovelAndgenres();
  }, [id, navigate, isAuthenticated, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
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
      const updatedNovel = await updateNovel(id, {
        title,
        description,
        imageUrl,
        genres: selectedgenres,
      });
      
      if (updatedNovel) {
        navigate(`/novels/${id}`);
      }
    } catch (error) {
      console.error("Error updating novel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNovel = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteNovel(id);
      if (success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting novel:", error);
    } finally {
      setIsDeleting(false);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-6">Edit Novel</h1>
          <div className="animate-pulse">
            <div className="h-10 bg-novel-200 rounded mb-4"></div>
            <div className="h-40 bg-novel-200 rounded mb-4"></div>
            <div className="h-10 bg-novel-200 rounded mb-4"></div>
            <div className="h-20 bg-novel-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-6">Edit Novel</h1>
        
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
                <Label htmlFor="genres">genres</Label>
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
                    <p className="text-sm text-novel-500 mb-2">Available genres:</p>
                    <div className="flex flex-wrap gap-2">
                      {availablegenres
                        .filter(tag => !selectedgenres.includes(tag.name))
                        .map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="cursor-pointer hover:bg-novel-200"
                            onClick={() => {
                              setSelectedgenres([...selectedgenres, tag.name]);
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/novels/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash size={16} />
                Delete Novel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Delete Novel
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this novel? This action cannot be undone and all chapters will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteNovel}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Layout>
  );
};

export default EditNovel;
