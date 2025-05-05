# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c41874af-47ee-41a0-8442-1440c08eb76f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c41874af-47ee-41a0-8442-1440c08eb76f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## API and Database Modifications

This project currently uses mock data services for novels and chapters. Here's how to modify the API and database functionality:

### Current Mock Service Structure

The application uses two main service files:
- `src/services/novelService.ts` - Handles novel CRUD operations
- `src/services/chapterService.ts` - Handles chapter CRUD operations

### How to Modify the Mock API

#### 1. Adding a New Novel Field

To add a new field to the Novel type:

1. First, update the type definition in `src/types/index.ts`:
```typescript
export type Novel = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  genres: Genre[];
  createdAt: string;
  updatedAt: string;
  // Add your new field
  author: string; // example new field
};

// Also update the form data type
export type NovelFormData = {
  title: string;
  description: string;
  imageUrl: string;
  genres: string[];
  // Add your new field
  author: string; // example new field
};
```

2. Update the mock data and functions in `src/services/novelService.ts`:
```typescript
const mockNovels: Novel[] = [
  {
    id: "1",
    title: "The Crystal Kingdom",
    description: "A young mage discovers her powers in a world where magic is forbidden.",
    imageUrl: "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb",
    genres: [mockgenres[0], mockgenres[5]],
    createdAt: new Date(2023, 5, 12).toISOString(),
    updatedAt: new Date(2023, 6, 14).toISOString(),
    author: "Jane Doe", // Add your new field to mock data
  },
  {
    id: "2",
    title: "Starship Odyssey",
    description: "The last survivors of Earth embark on a journey to find a new home.",
    imageUrl: "https://images.unsplash.com/photo-1501862700950-18382cd41497",
    genres: [mockgenres[1], mockgenres[5]],
    createdAt: new Date(2023, 3, 22).toISOString(),
    updatedAt: new Date(2023, 4, 30).toISOString(),
    author: "Jane Doe", // Add your new field to mock data
  },
  {
    id: "3",
    title: "Midnight Detective",
    description: "A detective with unusual methods solves crimes in a corrupt city.",
    imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb",
    genres: [mockgenres[3]],
    createdAt: new Date(2023, 1, 5).toISOString(),
    updatedAt: new Date(2023, 2, 15).toISOString(),
    author: "Jane Doe", // Add your new field to mock data
  },
  {
    id: "4",
    title: "Love in Paris",
    description: "Two strangers meet in Paris and their lives are changed forever.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    genres: [mockgenres[2], mockgenres[6]],
    createdAt: new Date(2023, 7, 19).toISOString(),
    updatedAt: new Date(2023, 8, 2).toISOString(),
    author: "Jane Doe", // Add your new field to mock data
  },
];

// Update the createNovel function
export const createNovel = async (novelData: NovelFormData): Promise<Novel> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Process genres (find existing or create new)
  const novelgenres = novelData.genres.map(tagName => {
    const existingGenre = availablegenres.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    
    if (existingGenre) {
      return existingGenre;
    }
    
    // Create new tag
    const newGenre = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: tagName.trim()
    };
    
    availablegenres.push(newGenre);
    return newGenre;
  });
  
  const newNovel: Novel = {
    id: `novel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: novelData.title,
    description: novelData.description,
    imageUrl: novelData.imageUrl,
    genres: novelgenres,
    author: novelData.author, // Add your new field
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  novels = [...novels, newNovel];
  toast.success("Novel created successfully!");
  return newNovel;
};

// Also update the updateNovel function similarly
```

#### 2. Adding a New API Function

To add a new API function to the service:

```typescript
// In src/services/novelService.ts

// Example: Get novels by author
export const getNovelsByAuthor = async (authorName: string): Promise<Novel[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return novels.filter(novel => 
    novel.author && novel.author.toLowerCase().includes(authorName.toLowerCase())
  );
};
```

### Integrating with a Real Backend

To connect this application to a real backend:

1. Install Axios or use the built-in fetch API
```sh
npm install axios
```

2. Create an API client (`src/utils/apiClient.ts`):
```typescript
import axios from 'axios';

const API_URL = 'https://your-api-url.com/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional: Add request/response interceptors
apiClient.interceptors.request.use(
  config => {
    // Add authentication token from localStorage if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

3. Modify the service to use the real API:
```typescript
// In src/services/novelService.ts
import { apiClient } from '../utils/apiClient';
import { Novel, NovelFormData } from "../types";
import { toast } from "sonner";

export const fetchNovels = async (): Promise<Novel[]> => {
  try {
    const response = await apiClient.get('/novels');
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch novels");
    console.error("Error fetching novels:", error);
    return [];
  }
};

export const createNovel = async (novelData: NovelFormData): Promise<Novel> => {
  try {
    const response = await apiClient.post('/novels', novelData);
    toast.success("Novel created successfully!");
    return response.data;
  } catch (error) {
    toast.error("Failed to create novel");
    console.error("Error creating novel:", error);
    throw error;
  }
};

// Similar changes for other functions
```

### Using Supabase

For a more integrated solution, you can connect this project to Supabase:

1. Install Supabase client:
```sh
npm install @supabase/supabase-js
```

2. Create Supabase client (`src/utils/supabaseClient.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

3. Update the service to use Supabase:
```typescript
// In src/services/novelService.ts
import { supabase } from '../utils/supabaseClient';
import { Novel, NovelFormData } from "../types";
import { toast } from "sonner";

export const fetchNovels = async (): Promise<Novel[]> => {
  try {
    const { data, error } = await supabase
      .from('novels')
      .select('*, genres(*)');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    toast.error("Failed to fetch novels");
    console.error("Error fetching novels:", error);
    return [];
  }
};

export const createNovel = async (novelData: NovelFormData): Promise<Novel> => {
  try {
    // First, insert the novel
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .insert({
        title: novelData.title,
        description: novelData.description,
        image_url: novelData.imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (novelError) throw novelError;
    
    // Then handle genres (assuming a many-to-many relationship)
    if (novelData.genres.length > 0) {
      // Process genres as needed
      // ...
    }
    
    toast.success("Novel created successfully!");
    return novel;
  } catch (error) {
    toast.error("Failed to create novel");
    console.error("Error creating novel:", error);
    throw error;
  }
};

// Similar changes for other functions
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c41874af-47ee-41a0-8442-1440c08eb76f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
