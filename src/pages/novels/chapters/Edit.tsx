
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Novel, Chapter } from "@/types";
import { fetchNovelById } from "@/services/novelService";
import { 
  fetchChapterById, 
  updateChapter, 
  deleteChapter,
  parseDocxFile
} from "@/services/chapterService";
import { ArrowLeft, File, Upload, Trash, AlertTriangle } from "lucide-react";
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

const EditChapter = () => {
  const { novelId, chapterId } = useParams<{ novelId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Akses ditolak",
        description: "Anda harus login untuk mengedit chapter",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    if (!novelId || !chapterId) return;

    const loadData = async () => {
      try {
        const [novelData, chapterData] = await Promise.all([
          fetchNovelById(novelId),
          fetchChapterById(chapterId),
        ]);
        
        if (!novelData || !chapterData || chapterData.novelId !== novelId) {
          navigate("/not-found", { replace: true });
          return;
        }
        
        setNovel(novelData);
        setChapter(chapterData);
        setTitle(chapterData.title);
        setContent(chapterData.content);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [novelId, chapterId, navigate, isAuthenticated, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (!selectedFile.name.endsWith('.docx')) {
        alert('Please upload a .docx file');
        return;
      }
      
      setFile(selectedFile);
      setIsProcessingFile(true);
      
      try {
        const extractedContent = await parseDocxFile(selectedFile);
        setContent(extractedContent);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("There was an error processing the file.");
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chapterId) return;
    
    // Validate form
    const newErrors = {
      title: !title.trim() ? "Title is required" : "",
      content: !content.trim() ? "Content is required" : "",
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedChapter = await updateChapter(chapterId, {
        title,
        content,
        file: file || undefined,
      });
      
      if (updatedChapter && novelId) {
        navigate(`/novels/${novelId}/chapters/${chapterId}`);
      }
    } catch (error) {
      console.error("Error updating chapter:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterId || !novelId) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteChapter(chapterId);
      if (success) {
        navigate(`/novels/${novelId}`);
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-novel-200 w-1/2 rounded mb-6"></div>
            <div className="h-10 bg-novel-200 rounded mb-4"></div>
            <div className="h-60 bg-novel-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!novel || !chapter) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Not Found</h2>
          <p className="text-novel-600 mb-6">The chapter or novel you're looking for doesn't exist.</p>
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent hover:text-primary"
            onClick={() => navigate(`/novels/${novelId}`)}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to {novel.title}
          </Button>
        </div>
        
        <h1 className="text-3xl font-serif font-bold mb-6">Edit Chapter</h1>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Chapter Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Chapter Content</Label>
                
                <div className="mb-4 p-4 bg-novel-50 rounded-md">
                  <div className="flex items-center mb-2">
                    <File size={16} className="mr-2 text-novel-600" />
                    <Label
                      htmlFor="docx-upload"
                      className="text-sm text-novel-600 cursor-pointer hover:text-primary transition-colors"
                    >
                      Upload .docx file (optional)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="docx-upload"
                      type="file"
                      accept=".docx"
                      onChange={handleFileChange}
                      disabled={isProcessingFile}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("docx-upload")?.click()}
                      disabled={isProcessingFile}
                      className="gap-2"
                    >
                      <Upload size={16} />
                      {isProcessingFile ? "Processing..." : "Choose File"}
                    </Button>
                    {file && (
                      <p className="text-sm text-novel-600">
                        {file.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your chapter content here"
                  className={`min-h-[300px] font-serif ${errors.content ? "border-red-500" : ""}`}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm">{errors.content}</p>
                )}
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
                  onClick={() => navigate(`/novels/${novelId}/chapters/${chapterId}`)}
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
                Delete Chapter
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Delete Chapter
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this chapter? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteChapter}
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

export default EditChapter;
