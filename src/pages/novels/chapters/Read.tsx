import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Novel, Chapter } from "@/types";
import { fetchNovelById } from "@/services/novelService";
import {
  fetchChapterById,
  fetchChaptersByNovelId,
} from "@/services/chapterService";
import { Edit, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ReadChapter = () => {
  const { novelId, chapterId } = useParams<{
    novelId: string;
    chapterId: string;
  }>();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (!novelId || !chapterId) return;

    const loadData = async () => {
      try {
        const [novelData, chapterData, chaptersData] = await Promise.all([
          fetchNovelById(novelId),
          fetchChapterById(chapterId),
          fetchChaptersByNovelId(novelId),
        ]);

        if (!novelData || !chapterData || chapterData.novelId !== novelId) {
          navigate("/not-found", { replace: true });
          return;
        }

        setNovel(novelData);
        setChapter(chapterData);

        // Find prev/next chapters
        const sortedChapters = chaptersData.sort((a, b) => a.order - b.order);
        const currentOrder = chapterData.order;

        const prevChapter = sortedChapters.find(
          (ch) => ch.order === currentOrder - 1
        );
        const nextChapter = sortedChapters.find(
          (ch) => ch.order === currentOrder + 1
        );

        setPrevChapterId(prevChapter ? prevChapter.id : null);
        setNextChapterId(nextChapter ? nextChapter.id : null);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [novelId, chapterId, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-novel-200 w-1/2 rounded mb-6"></div>
            <div className="h-6 bg-novel-200 w-3/4 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-novel-200 rounded w-full"></div>
              ))}
            </div>
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
          <p className="text-novel-600 mb-6">
            The chapter or novel you're looking for doesn't exist.
          </p>
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={chapter ? `${chapter.title} - ${novel?.title}` : "Baca Chapter"}
      description={novel ? `Baca chapter ${chapter?.title} dari novel ${novel.title}` : "Baca chapter novel."}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent hover:text-primary"
            onClick={() => navigate(`/novels/${novelId}`)}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Novel
          </Button>

          {isAuthenticated && (
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link to={`/novels/${novelId}/chapters/${chapterId}/edit`}>
                <Edit size={16} />
                Edit
              </Link>
            </Button>
          )}
        </div>
        <div className="flex justify-between items-center py-2">
            {prevChapterId ? (
              <Button
                asChild
                variant="outline"
                onClick={scrollToTop}
                className="gap-2"
              >
                <Link to={`/novels/${novelId}/chapters/${prevChapterId}`}>
                  <ArrowLeft size={16} />
                  Previous
                </Link>
              </Button>
            ) : (
              <div></div>
            )}

            {nextChapterId ? (
              <Button asChild onClick={scrollToTop} className="gap-2">
                <Link to={`/novels/${novelId}/chapters/${nextChapterId}`}>
                  Next
                  <ArrowRight size={16} />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to={`/novels/${novelId}`}>Back to Novel</Link>
              </Button>
            )}
          </div>

        <article className="book-page mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-center ">
            {chapter.title}
          </h1>


          <div className="chapter-content">
            {chapter.content.split("\n").map((paragraph, index) => {
              // Check if paragraph contains an image URL
              const imageUrlMatch = paragraph.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i);
              if (imageUrlMatch) {
                return (
                  <div key={index} className="my-4 flex justify-center">
                    <img 
                      src={paragraph} 
                      alt="Chapter content image" 
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      loading="lazy"
                    />
                  </div>
                );
              }
              return <p key={index} className="mb-4">{paragraph}</p>;
            })}
          </div>
        </article>

        <div className="flex justify-between items-center py-1">
            {prevChapterId ? (
              <Button
                asChild
                variant="outline"
                onClick={scrollToTop}
                className="gap-2"
              >
                <Link to={`/novels/${novelId}/chapters/${prevChapterId}`}>
                  <ArrowLeft size={16} />
                  Previous
                </Link>
              </Button>
            ) : (
              <div></div>
            )}

            {nextChapterId ? (
              <Button asChild onClick={scrollToTop} className="gap-2">
                <Link to={`/novels/${novelId}/chapters/${nextChapterId}`}>
                  Next
                  <ArrowRight size={16} />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to={`/novels/${novelId}`}>Back to Novel</Link>
              </Button>
            )}
          </div>

        {showBackToTop && (
          <Button
            variant="secondary"
            size="icon"
            className="fixed bottom-8 right-8 rounded-full shadow-lg"
            onClick={scrollToTop}
          >
            <ArrowUp size={20} />
          </Button>
        )}
      </div>
    </Layout>
  );
};

export default ReadChapter;
