
export type Genre = {
  id: string;
  name: string;
};

export type Novel = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  genres: Genre[];
  createdAt: string;
  updatedAt: string;
};

export type Chapter = {
  id: string;
  novelId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

// For form data
export type NovelFormData = {
  title: string;
  description: string;
  imageUrl: string;
  genres: string[];
};

export type ChapterFormData = {
  title: string;
  content: string;
  file?: File;
};
