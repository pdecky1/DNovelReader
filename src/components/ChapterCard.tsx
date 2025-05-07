import React from "react";
import { Link } from "react-router-dom";
import { Chapter, Novel } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

type ChapterCardProps = {
  chapter: Chapter;
  novel: Novel;
};

const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, novel }) => {
  return (
    <Link
      to={`/novels/${novel.id}/chapters/${chapter.id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-primary-500 transition-transform duration-300 hover:-translate-y-1"
      aria-label={`Baca ${chapter.title}`}
    >
      <Card className="h-full flex flex-col overflow-hidden">
        <div className="relative h-40 overflow-hidden">
          <img
            src={novel.imageUrl}
            alt={novel.title}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1532012197267-da84d127e765";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t to-black/60 from-transparent flex items-start">
            <h3 className="text-lg font-bold text-white p-3 font-serif">
              {novel.title}
            </h3>
          </div>
        </div>
        <CardContent className="flex-1 pt-3">
          <h4 className="font-medium mb-2">{chapter.title}</h4>
          <p className="text-sm text-novel-500">
            {formatDistanceToNow(new Date(chapter.updatedAt), {
              addSuffix: true,
              locale: id,
            })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ChapterCard;
