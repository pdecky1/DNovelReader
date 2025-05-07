import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import NovelCard from "@/components/NovelCard";
import ChapterCard from "@/components/ChapterCard";
import { Button } from "@/components/ui/button";
import { Novel, Chapter } from "@/types";
import { fetchNovels } from "@/services/novelService";
import { fetchChaptersByNovelId } from "@/services/chapterService";
import { Book, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const Index = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [latestChapters, setLatestChapters] = useState<
    Array<{ chapter: Chapter; novel: Novel }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const chaptersPerPage = 8;
  const totalPages = Math.ceil(latestChapters.length / chaptersPerPage);

  useEffect(() => {
    const loadData = async () => {
      try {
        const novelsData = await fetchNovels();
        // Sort novels by updatedAt in descending order and take only 4
        const sortedNovels = [...novelsData].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 4);
        setNovels(sortedNovels);

        // Fetch latest chapters for each novel
        const chaptersPromises = novelsData.map(async (novel) => {
          const chapters = await fetchChaptersByNovelId(novel.id);
          if (chapters.length > 0) {
            // Get the latest chapter
            const latestChapter = chapters.reduce((latest, current) =>
              new Date(current.updatedAt) > new Date(latest.updatedAt)
                ? current
                : latest
            );
            return { chapter: latestChapter, novel };
          }
          return null;
        });

        const chaptersResults = await Promise.all(chaptersPromises);
        const validChapters = chaptersResults.filter(
          (result): result is { chapter: Chapter; novel: Novel } =>
            result !== null
        );

        // Sort by updatedAt in descending order
        validChapters.sort(
          (a, b) =>
            new Date(b.chapter.updatedAt).getTime() -
            new Date(a.chapter.updatedAt).getTime()
        );

        setLatestChapters(validChapters);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Layout
      title="Beranda"
      description="Jelajahi dunia imajinasi melalui koleksi novel kami atau bagikan karya kreatif Anda sendiri."
    >
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold">
            Featured Novels
          </h2>
          <Link to="/search" className="text-primary hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-novel-200 h-56 rounded-md mb-4"></div>
                <div className="bg-novel-200 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-novel-200 h-4 rounded mb-2"></div>
                <div className="bg-novel-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </section>
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold">
            Latest Updates
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-novel-200 h-40 rounded-md mb-4"></div>
                <div className="bg-novel-200 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-novel-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestChapters
              .slice(
                (currentPage - 1) * chaptersPerPage,
                currentPage * chaptersPerPage
              )
              .map(({ chapter, novel }) => (
                <ChapterCard key={chapter.id} chapter={chapter} novel={novel} />
              ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
