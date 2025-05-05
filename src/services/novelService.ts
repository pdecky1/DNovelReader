
import { Novel, NovelFormData, Genre } from "../types";
import { toast } from "sonner";
import { getSupabase, handleSupabaseError, isSupabaseConfigured, isCryptoAvailable } from "@/utils/supabaseClient";
import { mockNovels, mockgenres } from "./mockData"; // We'll create this file for fallback

// Use mock data as fallback when Supabase isn't configured
let novels = [...mockNovels];
let availablegenres = [...mockgenres];

export const fetchNovels = async (): Promise<Novel[]> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return novels;
    }

    const supabase = getSupabase();
    const { data: novelsData, error: novelsError } = await supabase
      .from('novels')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (novelsError) return handleSupabaseError(novelsError, "Failed to fetch novels");

    // Parse the genres from the JSON field in the novels table
    const novelsWithgenres = novelsData.map(novel => {
      let genres: Genre[] = [];
      
      // Check if novel.genres exists and is a valid JSON string or array
      if (novel.genres) {
        try {
          // If genres is already an array, use it directly, otherwise parse it
          if (Array.isArray(novel.genres)) {
            genres = novel.genres;
          } else if (typeof novel.genres === 'string') {
            genres = JSON.parse(novel.genres);
          }
        } catch (error) {
          console.error("Error parsing genres for novel:", novel.id, error);
        }
      }
      
      return {
        id: novel.id,
        title: novel.title,
        description: novel.description,
        imageUrl: novel.image_url,
        genres: genres,
        createdAt: novel.created_at,
        updatedAt: novel.updated_at
      };
    });
    
    return novelsWithgenres;
  } catch (error) {
    console.error("Error fetching novels:", error);
    toast.error("Failed to fetch novels");
    
    // Fallback to mock data
    return novels;
  }
};

export const fetchNovelById = async (id: string): Promise<Novel | undefined> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return novels.find(novel => novel.id === id);
    }

    const supabase = getSupabase();
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .select('*')
      .eq('id', id)
      .single();
      
    if (novelError) {
      if (novelError.code === 'PGRST116') return undefined; // No rows found
      return handleSupabaseError(novelError, "Failed to fetch novel");
    }
    
    // Parse the genres from the JSON field
    let genres: Genre[] = [];
    if (novel.genres) {
      try {
        // If genres is already an array, use it directly, otherwise parse it
        if (Array.isArray(novel.genres)) {
          genres = novel.genres;
        } else if (typeof novel.genres === 'string') {
          genres = JSON.parse(novel.genres);
        }
      } catch (error) {
        console.error("Error parsing genres for novel:", novel.id, error);
      }
    }
    
    return {
      id: novel.id,
      title: novel.title,
      description: novel.description,
      imageUrl: novel.image_url,
      genres: genres,
      createdAt: novel.created_at,
      updatedAt: novel.updated_at
    };
  } catch (error) {
    console.error("Error fetching novel:", error);
    toast.error("Failed to fetch novel");
    
    // Fallback to mock data
    return novels.find(novel => novel.id === id);
  }
};

export const createNovel = async (novelData: NovelFormData): Promise<Novel> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      novels = [...novels, newNovel];
      toast.success("Novel created successfully!");
      return newNovel;
    }

    const supabase = getSupabase();
    
    // Check if crypto is available for UUID generation
    if (!isCryptoAvailable()) {
      toast.error("Your browser does not support secure ID generation.");
      throw new Error("Crypto API is not available for UUID generation");
    }
    
    // Generate a UUID for the novel
    const novelId = crypto.randomUUID();
    
    // 1. Process genres first to create any new genres in the genres table
    const novelgenres: Genre[] = [];
    for (const tagName of novelData.genres) {
      // Check if tag exists
      let { data: existingGenre, error: tagFetchError } = await supabase
        .from('genres')
        .select('id, name')
        .ilike('name', tagName.trim())
        .maybeSingle();
        
      if (tagFetchError) {
        console.error("Error fetching tag:", tagFetchError);
      }
      
      let tagId;
      let tagNameToUse = tagName.trim();
      
      if (existingGenre) {
        tagId = existingGenre.id;
        tagNameToUse = existingGenre.name;
      } else {
        // Create new tag with UUID
        const newGenreId = crypto.randomUUID();
        const { data: newGenre, error: tagCreateError } = await supabase
          .from('genres')
          .insert({ id: newGenreId, name: tagNameToUse })
          .select()
          .single();
          
        if (tagCreateError) {
          console.error("Error creating tag:", tagCreateError);
          continue; // Skip this tag if there's an error
        }
        
        tagId = newGenre.id;
        tagNameToUse = newGenre.name;
      }
      
      novelgenres.push({ id: tagId, name: tagNameToUse });
    }
    
    // 2. Insert the novel with genres as a JSON array
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .insert({
        id: novelId,
        title: novelData.title,
        description: novelData.description,
        image_url: novelData.imageUrl,
        genres: novelgenres, // genres will be stored as a JSON array in the novels table
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (novelError) return handleSupabaseError(novelError, "Failed to create novel");
    
    toast.success("Novel created successfully!");
    return {
      id: novel.id,
      title: novel.title,
      description: novel.description,
      imageUrl: novel.image_url,
      genres: novelgenres,
      createdAt: novel.created_at,
      updatedAt: novel.updated_at
    };
  } catch (error) {
    console.error("Error creating novel:", error);
    toast.error("Failed to create novel");
    throw error;
  }
};

export const updateNovel = async (id: string, novelData: NovelFormData): Promise<Novel | undefined> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const novelIndex = novels.findIndex(novel => novel.id === id);
      
      if (novelIndex === -1) {
        toast.error("Novel not found");
        return undefined;
      }
      
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
      
      const updatedNovel: Novel = {
        ...novels[novelIndex],
        title: novelData.title,
        description: novelData.description,
        imageUrl: novelData.imageUrl,
        genres: novelgenres,
        updatedAt: new Date().toISOString()
      };
      
      novels = novels.map(novel => 
        novel.id === id ? updatedNovel : novel
      );
      
      toast.success("Novel updated successfully!");
      return updatedNovel;
    }

    const supabase = getSupabase();
    
    // 1. Process genres first to create any new genres
    const novelgenres: Genre[] = [];
    for (const tagName of novelData.genres) {
      // Check if tag exists
      let { data: existingGenre, error: tagFetchError } = await supabase
        .from('genres')
        .select('id, name')
        .ilike('name', tagName.trim())
        .maybeSingle();
        
      if (tagFetchError) {
        console.error("Error fetching tag:", tagFetchError);
      }
      
      let tagId;
      let tagNameToUse = tagName.trim();
      
      if (existingGenre) {
        tagId = existingGenre.id;
        tagNameToUse = existingGenre.name;
      } else {
        // Create new tag
        const newGenreId = crypto.randomUUID();
        const { data: newGenre, error: tagCreateError } = await supabase
          .from('genres')
          .insert({ id: newGenreId, name: tagNameToUse })
          .select()
          .single();
          
        if (tagCreateError) {
          console.error("Error creating tag:", tagCreateError);
          continue; // Skip this tag if there's an error
        }
        
        tagId = newGenre.id;
        tagNameToUse = newGenre.name;
      }
      
      novelgenres.push({ id: tagId, name: tagNameToUse });
    }
    
    // 2. Update the novel with genres as a JSON array
    const { data: novel, error: novelError } = await supabase
      .from('novels')
      .update({
        title: novelData.title,
        description: novelData.description,
        image_url: novelData.imageUrl,
        genres: novelgenres, // genres stored as JSON array
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (novelError) {
      if (novelError.code === 'PGRST116') {
        toast.error("Novel not found");
        return undefined;
      }
      return handleSupabaseError(novelError, "Failed to update novel");
    }
    
    toast.success("Novel updated successfully!");
    return {
      id: novel.id,
      title: novel.title,
      description: novel.description,
      imageUrl: novel.image_url,
      genres: novelgenres,
      createdAt: novel.created_at,
      updatedAt: novel.updated_at
    };
  } catch (error) {
    console.error("Error updating novel:", error);
    toast.error("Failed to update novel");
    throw error;
  }
};

export const deleteNovel = async (id: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const initialLength = novels.length;
      novels = novels.filter(novel => novel.id !== id);
      
      if (novels.length < initialLength) {
        toast.success("Novel deleted successfully!");
        return true;
      }
      
      toast.error("Novel not found");
      return false;
    }

    const supabase = getSupabase();
    
    // First delete related chapters (cascade would be better in the database)
    const { error: chaptersError } = await supabase
      .from('chapters')
      .delete()
      .eq('novel_id', id);
    
    if (chaptersError) {
      console.error("Error deleting related chapters:", chaptersError);
    }
    
    // Delete the novel (no need to delete tag associations since genres are stored in the novels table)
    const { error: novelError } = await supabase
      .from('novels')
      .delete()
      .eq('id', id);
      
    if (novelError) return handleSupabaseError(novelError, "Failed to delete novel");
    
    toast.success("Novel deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting novel:", error);
    toast.error("Failed to delete novel");
    return false;
  }
};

export const fetchgenres = async (): Promise<Genre[]> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return availablegenres;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('genres')
      .select('id, name')
      .order('name');
      
    if (error) return handleSupabaseError(error, "Failed to fetch genres");
    
    return data as Genre[];
  } catch (error) {
    console.error("Error fetching genres:", error);
    toast.error("Failed to fetch genres");
    
    // Fallback to mock data
    return availablegenres;
  }
};

export const searchNovels = async (query: string, selectedgenres: string[] = []): Promise<Novel[]> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const searchResults = novels.filter(novel => {
        const matchesQuery = query ? 
          novel.title.toLowerCase().includes(query.toLowerCase()) ||
          novel.description.toLowerCase().includes(query.toLowerCase()) 
          : true;
        
        const matchesgenres = selectedgenres.length > 0 ? 
          selectedgenres.every(tagId => 
            novel.genres.some(tag => tag.id === tagId)
          ) : true;
        
        return matchesQuery && matchesgenres;
      });
      
      return searchResults;
    }

    const supabase = getSupabase();
    
    if (!query && selectedgenres.length === 0) {
      // If no search criteria, just return all novels
      return fetchNovels();
    }
    
    let query_builder = supabase
      .from('novels')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Add text search if query provided
    if (query) {
      query_builder = query_builder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    
    const { data: novelsData, error: novelsError } = await query_builder;
    
    if (novelsError) return handleSupabaseError(novelsError, "Failed to search novels");
    
    // Parse genres and handle tag filtering
    const novelsWithgenres = novelsData.map(novel => {
      let genres: Genre[] = [];
      
      if (novel.genres) {
        try {
          // If genres is already an array, use it directly, otherwise parse it
          if (Array.isArray(novel.genres)) {
            genres = novel.genres;
          } else if (typeof novel.genres === 'string') {
            genres = JSON.parse(novel.genres);
          }
        } catch (error) {
          console.error("Error parsing genres for novel:", novel.id, error);
        }
      }
      
      return {
        id: novel.id,
        title: novel.title,
        description: novel.description,
        imageUrl: novel.image_url,
        genres: genres,
        createdAt: novel.created_at,
        updatedAt: novel.updated_at
      };
    });
    
    // Filter by genres on the client side if needed
    if (selectedgenres.length > 0) {
      return novelsWithgenres.filter(novel => 
        selectedgenres.every(tagId => 
          novel.genres.some(tag => tag.id === tagId)
        )
      );
    }
    
    return novelsWithgenres;
  } catch (error) {
    console.error("Error searching novels:", error);
    toast.error("Failed to search novels");
    
    // Fallback to mock data
    return novels;
  }
};