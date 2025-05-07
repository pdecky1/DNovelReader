
import React from "react";
import { Link } from "react-router-dom";
import { Novel } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type NovelCardProps = {
  novel: Novel;
};

const NovelCard: React.FC<NovelCardProps> = ({ novel }) => {
  return (
    <Card className="book-cover h-full flex flex-col overflow-hidden hover:transform hover:-translate-y-1 transition-transform duration-300">
      <div className="relative h-56 overflow-hidden">
        <img
          src={novel.imageUrl}
          alt={novel.title}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1532012197267-da84d127e765";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <h3 className="text-xl font-bold text-white p-4 font-serif">
            {novel.title}
          </h3>
        </div>
      </div>
      <CardContent className="flex-1 pt-4">
        <p className="text-sm text-novel-600 line-clamp-3">
          {novel.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-0 pb-4">
        {novel.genres.map((tag) => (
          <Badge key={tag.id} variant="outline" className="bg-novel-200">
            {tag.name}
          </Badge>
        ))}
      </CardFooter>
      <Link
        to={`/novels/${novel.id}`}
        className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`View ${novel.title}`}
      >
        <span className="sr-only">View novel</span>
      </Link>
    </Card>
  );
};

export default NovelCard;
