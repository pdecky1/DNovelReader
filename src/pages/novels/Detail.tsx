import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Novel, Chapter } from "@/types";
import { fetchNovelById } from "@/services/novelService";
import { fetchChaptersByNovelId } from "@/services/chapterService";
import {
  Edit,
  Plus,
  Book,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const NovelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("oldest");
  const chaptersPerPage = 10;
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!id) return;

    const loadNovelAndChapters = async () => {
      try {
        const [novelData, chaptersData] = await Promise.all([
          fetchNovelById(id),
          fetchChaptersByNovelId(id),
        ]);

        if (novelData) {
          setNovel(novelData);
          const sortedChapters = [...chaptersData].sort((a, b) =>
            sortOrder === "newest"
              ? new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              : new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
          );
          setChapters(sortedChapters);
        } else {
          navigate("/not-found", { replace: true });
        }
      } catch (error) {
        console.error("Error loading novel data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNovelAndChapters();
  }, [id, navigate, sortOrder]);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-60 bg-novel-200 rounded-md mb-6"></div>
          <div className="h-10 bg-novel-200 w-2/3 rounded mb-4"></div>
          <div className="h-4 bg-novel-200 w-1/4 rounded mb-6"></div>
          <div className="h-20 bg-novel-200 rounded mb-6"></div>
          <div className="h-12 bg-novel-200 rounded mb-4"></div>
        </div>
      </Layout>
    );
  }

  if (!novel) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Novel not found</h2>
          <p className="text-novel-600 mb-6">
            The novel you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={novel ? novel.title : "Detail Novel"}
      description={novel ? novel.description : "Informasi detail tentang novel."}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          asChild
          className="mb-6 p-0 hover:bg-transparent hover:text-primary"
        >
          <Link to="/" className="flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Cover image */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="book-cover">
              <img
                src={novel.imageUrl}
                alt={novel.title}
                className="w-full object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://images.unsplash.com/photo-1532012197267-da84d127e765";
                }}
              />
            </div>
          </div>

          {/* Novel details */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-4xl font-serif font-bold">
                {novel.title}
              </h1>
              {isAuthenticated && (
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link to={`/novels/${id}/edit`}>
                    <Edit size={16} />
                    Edit
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {novel.genres.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <p className="text-novel-600 mb-6 whitespace-pre-line">
              {novel.description}
            </p>

            <div className="text-sm text-novel-500">
              <p>Created: {new Date(novel.createdAt).toLocaleDateString()}</p>
              <p>
                Last updated: {new Date(novel.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Chapters section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4">
              <h2 className="text-2xl font-serif font-bold">Chapters</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-2">
              {isAuthenticated && (
                <Button asChild className="gap-1">
                  <Link to={`/novels/${id}/chapters/create`}>
                    <Plus size={16} />
                    Add Chapter
                  </Link>
                </Button>
              )}
              <Select
                value={sortOrder}
                onValueChange={(value: "newest" | "oldest") =>
                  setSortOrder(value)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="mb-4" />

          {chapters.length > 0 ? (
            <div className="space-y-2">
              {chapters
                .slice(
                  (currentPage - 1) * chaptersPerPage,
                  currentPage * chaptersPerPage
                )
                .map((chapter, index) => (
                  <Card
                    key={chapter.id}
                    className="overflow-hidden hover:shadow transition-shadow"
                  >
                    <Link
                      to={`/novels/${id}/chapters/${chapter.id}`}
                      className="flex items-center p-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-novel-100 rounded-full flex items-center justify-center mr-4 text-novel-700 font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{chapter.title}</h3>
                        <p className="text-sm text-novel-500">
                          {new Date(chapter.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-novel-400" />
                    </Link>
                  </Card>
                ))}

              {/* Pagination */}
              {chapters.length > chaptersPerPage && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 py-2 bg-novel-100 rounded">
                    {currentPage} /{" "}
                    {Math.ceil(chapters.length / chaptersPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil(chapters.length / chaptersPerPage),
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(chapters.length / chaptersPerPage)
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-novel-50 rounded-md">
              <Book className="mx-auto h-12 w-12 text-novel-400 mb-2" />
              <h3 className="font-semibold mb-1">No Chapters Yet</h3>
              <p className="text-novel-500 mb-4">
                Start adding chapters to your novel!
              </p>
              <Button asChild>
                <Link to={`/novels/${id}/chapters/create`}>
                  Create First Chapter
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NovelDetail;
