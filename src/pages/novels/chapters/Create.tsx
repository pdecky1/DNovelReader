
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Novel } from "@/types";
import { fetchNovelById } from "@/services/novelService";
import { createChapter, parseDocxFile } from "@/services/chapterService";
import { ArrowLeft, File, Upload, Files } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CreateChapter = () => {
  const { novelId } = useParams<{ novelId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoadingNovel, setIsLoadingNovel] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [currentFile, setCurrentFile] = useState("");
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Akses ditolak",
        description: "Anda harus login untuk membuat chapter baru",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    if (!novelId) {
      navigate("/not-found", { replace: true });
      return;
    }

    const loadNovel = async () => {
      try {
        const novelData = await fetchNovelById(novelId);
        
        if (novelData) {
          setNovel(novelData);
        } else {
          navigate("/not-found", { replace: true });
        }
      } catch (error) {
        console.error("Error loading novel:", error);
      } finally {
        setIsLoadingNovel(false);
      }
    };

    loadNovel();
  }, [novelId, navigate, isAuthenticated, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => file.name.endsWith('.docx'));
      
      if (selectedFiles.length === 0) {
        alert('Please upload .docx files only');
        return;
      }

      if (isBatchMode) {
        setFiles(selectedFiles);
      } else {
        const selectedFile = selectedFiles[0];
        setIsProcessingFile(true);
        
        try {
          const extractedContent = await parseDocxFile(selectedFile);
          setContent(extractedContent);
          setTitle(selectedFile.name.replace('.docx', ''));
        } catch (error) {
          console.error("Error processing file:", error);
          alert("There was an error processing the file.");
        } finally {
          setIsProcessingFile(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novelId) return;

    if (isBatchMode) {
      if (files.length === 0) {
        alert('Please select files to upload');
        return;
      }
      
      setIsSubmitting(true);
      setProgress(0);
      
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setCurrentFile(file.name);
          
          const content = await parseDocxFile(file);
          const title = file.name.replace('.docx', '');
          
          await createChapter(novelId, {
            title,
            content,
            order: i + 1
          });

          setProgress(((i + 1) / files.length) * 100);
        }
        
        navigate(`/novels/${novelId}`);
      } catch (error) {
        console.error("Error creating chapters:", error);
        alert("There was an error uploading the chapters.");
      } finally {
        setIsSubmitting(false);
        setCurrentFile("");
        setProgress(0);
      }
    } else {
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
        const chapter = await createChapter(novelId, {
          title,
          content,
        });
        
        navigate(`/novels/${novelId}/chapters/${chapter.id}`);
      } catch (error) {
        console.error("Error creating chapter:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoadingNovel) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-novel-200 w-1/2 rounded mb-6"></div>
            <div className="h-10 bg-novel-200 rounded mb-4"></div>
            <div className="h-60 bg-novel-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!novel) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Novel not found</h2>
          <p className="text-novel-600 mb-6">The novel you're looking for doesn't exist.</p>
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
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif font-bold">Add New Chapter</h1>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsBatchMode(!isBatchMode)}
            >
              <Files size={16} />
              {isBatchMode ? 'Single Upload' : 'Batch Upload'}
            </Button>
          </div>
          {isBatchMode && (
            <p className="text-sm text-novel-600">
              Upload multiple chapters at once by selecting multiple .docx files
            </p>
          )}
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                {!isBatchMode && (
                  <>
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
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>{isBatchMode ? 'Upload Chapters' : 'Chapter Content'}</Label>
                
                <div className="mb-4 p-4 bg-novel-50 rounded-md">
                  <div className="flex items-center mb-2">
                    <File size={16} className="mr-2 text-novel-600" />
                    <Label
                      htmlFor="docx-upload"
                      className="text-sm text-novel-600 cursor-pointer hover:text-primary transition-colors"
                    >
                      {isBatchMode ? 'Upload multiple .docx files' : 'Upload .docx file'}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="docx-upload"
                      type="file"
                      accept=".docx"
                      multiple={isBatchMode}
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
                      Choose Files
                    </Button>
                  </div>
                  {!isBatchMode && files[0] && (
                    <div className="mt-2">
                      <p className="text-sm text-novel-600">
                        Selected file: {files[0].name}
                      </p>
                    </div>
                  )}
                  {isBatchMode && files.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-novel-600">
                        Selected {files.length} files
                      </p>
                    </div>
                  )}
                </div>
                
                {!isBatchMode && (
                  <>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter chapter content"
                      className={`min-h-[300px] ${errors.content ? "border-red-500" : ""}`}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm">{errors.content}</p>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Adding Chapter..." : "Add Chapter"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/novels/${novelId}`)}
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

export default CreateChapter;
