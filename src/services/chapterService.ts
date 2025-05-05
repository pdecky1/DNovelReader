
import { Chapter, ChapterFormData } from "../types";
import { toast } from "sonner";
import { getSupabase, handleSupabaseError, isSupabaseConfigured } from "@/utils/supabaseClient";
import { mockChapters } from "./mockData"; // We'll create this file for fallback

// Use mock data as fallback when Supabase isn't configured
let chapters = [...mockChapters];

export const fetchChaptersByNovelId = async (novelId: string): Promise<Chapter[]> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return chapters
        .filter(chapter => chapter.novelId === novelId)
        .sort((a, b) => a.order - b.order);
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .order('order');
      
    if (error) return handleSupabaseError(error, "Failed to fetch chapters");
    
    return data.map(chapter => ({
      id: chapter.id,
      novelId: chapter.novel_id,
      title: chapter.title,
      content: chapter.content,
      order: chapter.order,
      createdAt: chapter.created_at,
      updatedAt: chapter.updated_at
    }));
  } catch (error) {
    console.error("Error fetching chapters:", error);
    toast.error("Failed to fetch chapters");
    
    // Fallback to mock data
    return chapters
      .filter(chapter => chapter.novelId === novelId)
      .sort((a, b) => a.order - b.order);
  }
};

export const fetchChapterById = async (id: string): Promise<Chapter | undefined> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return chapters.find(chapter => chapter.id === id);
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows found
      return handleSupabaseError(error, "Failed to fetch chapter");
    }
    
    return {
      id: data.id,
      novelId: data.novel_id,
      title: data.title,
      content: data.content,
      order: data.order,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error fetching chapter:", error);
    toast.error("Failed to fetch chapter");
    
    // Fallback to mock data
    return chapters.find(chapter => chapter.id === id);
  }
};

export const createChapter = async (novelId: string, chapterData: ChapterFormData): Promise<Chapter> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get current chapters for this novel to determine order
      const novelChapters = chapters.filter(ch => ch.novelId === novelId);
      const nextOrder = novelChapters.length > 0 
        ? Math.max(...novelChapters.map(ch => ch.order)) + 1 
        : 1;
      
      const newChapter: Chapter = {
        id: `chapter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        novelId,
        title: chapterData.title,
        content: chapterData.content,
        order: nextOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      chapters = [...chapters, newChapter];
      toast.success("Chapter created successfully!");
      return newChapter;
    }

    const supabase = getSupabase();
    
    // Get current max order for this novel
    const { data: existingChapters, error: countError } = await supabase
      .from('chapters')
      .select('order')
      .eq('novel_id', novelId)
      .order('order', { ascending: false })
      .limit(1);
      
    if (countError) return handleSupabaseError(countError, "Failed to determine chapter order");
    
    const nextOrder = existingChapters.length > 0 ? (existingChapters[0].order + 1) : 1;
    
    // Create the chapter
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        novel_id: novelId,
        title: chapterData.title,
        content: chapterData.content,
        order: nextOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) return handleSupabaseError(error, "Failed to create chapter");
    
    toast.success("Chapter created successfully!");
    return {
      id: data.id,
      novelId: data.novel_id,
      title: data.title,
      content: data.content,
      order: data.order,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error creating chapter:", error);
    toast.error("Failed to create chapter");
    throw error;
  }
};

export const updateChapter = async (id: string, chapterData: ChapterFormData): Promise<Chapter | undefined> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const chapterIndex = chapters.findIndex(chapter => chapter.id === id);
      
      if (chapterIndex === -1) {
        toast.error("Chapter not found");
        return undefined;
      }
      
      const updatedChapter: Chapter = {
        ...chapters[chapterIndex],
        title: chapterData.title,
        content: chapterData.content,
        updatedAt: new Date().toISOString()
      };
      
      chapters = chapters.map(chapter => 
        chapter.id === id ? updatedChapter : chapter
      );
      
      toast.success("Chapter updated successfully!");
      return updatedChapter;
    }

    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('chapters')
      .update({
        title: chapterData.title,
        content: chapterData.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        toast.error("Chapter not found");
        return undefined;
      }
      return handleSupabaseError(error, "Failed to update chapter");
    }
    
    toast.success("Chapter updated successfully!");
    return {
      id: data.id,
      novelId: data.novel_id,
      title: data.title,
      content: data.content,
      order: data.order,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error updating chapter:", error);
    toast.error("Failed to update chapter");
    throw error;
  }
};

export const deleteChapter = async (id: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const initialLength = chapters.length;
      const chapterToDelete = chapters.find(chapter => chapter.id === id);
      
      if (!chapterToDelete) {
        toast.error("Chapter not found");
        return false;
      }
      
      chapters = chapters.filter(chapter => chapter.id !== id);
      
      // Update order for remaining chapters
      const novelChapters = chapters
        .filter(ch => ch.novelId === chapterToDelete.novelId)
        .sort((a, b) => a.order - b.order);
      
      chapters = chapters.map(chapter => {
        if (chapter.novelId === chapterToDelete.novelId) {
          const newOrder = novelChapters.findIndex(ch => ch.id === chapter.id) + 1;
          return { ...chapter, order: newOrder };
        }
        return chapter;
      });
      
      toast.success("Chapter deleted successfully!");
      return true;
    }

    const supabase = getSupabase();
    
    // Get the chapter to find its novel_id
    const { data: chapterToDelete, error: fetchError } = await supabase
      .from('chapters')
      .select('novel_id')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        toast.error("Chapter not found");
        return false;
      }
      return handleSupabaseError(fetchError, "Failed to find chapter");
    }
    
    // Delete the chapter
    const { error: deleteError } = await supabase
      .from('chapters')
      .delete()
      .eq('id', id);
      
    if (deleteError) return handleSupabaseError(deleteError, "Failed to delete chapter");
    
    // Update order for remaining chapters
    const { data: remainingChapters, error: fetchRemainingError } = await supabase
      .from('chapters')
      .select('id')
      .eq('novel_id', chapterToDelete.novel_id)
      .order('order');
      
    if (fetchRemainingError) {
      console.error("Error fetching remaining chapters:", fetchRemainingError);
    } else {
      // Update each chapter's order
      for (let i = 0; i < remainingChapters.length; i++) {
        await supabase
          .from('chapters')
          .update({ order: i + 1 })
          .eq('id', remainingChapters[i].id);
      }
    }
    
    toast.success("Chapter deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting chapter:", error);
    toast.error("Failed to delete chapter");
    return false;
  }
};

export const updateChapterOrder = async (novelId: string, reorderedChapters: string[]): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update order for each chapter
      chapters = chapters.map(chapter => {
        if (chapter.novelId === novelId) {
          const newOrder = reorderedChapters.indexOf(chapter.id) + 1;
          if (newOrder > 0) { // Only update if chapter is in the reordered list
            return { ...chapter, order: newOrder };
          }
        }
        return chapter;
      });
      
      toast.success("Chapter order updated");
      return true;
    }

    const supabase = getSupabase();
    
    // Update each chapter's order based on the provided array
    for (let i = 0; i < reorderedChapters.length; i++) {
      const { error } = await supabase
        .from('chapters')
        .update({ order: i + 1 })
        .eq('id', reorderedChapters[i]);
        
      if (error) {
        console.error(`Error updating order for chapter ${reorderedChapters[i]}:`, error);
      }
    }
    
    toast.success("Chapter order updated");
    return true;
  } catch (error) {
    console.error("Error updating chapter order:", error);
    toast.error("Failed to update chapter order");
    return false;
  }
};

import { parseDocxFile as parseDocx, parseBatchDocxFiles } from '@/utils/docxParser';

export const parseDocxFile = async (file: File): Promise<string> => {
  const result = await parseDocx(file);
  if (result.error) {
    throw new Error(result.error);
  }
  return result.content;
};

export const processBatchDocxFiles = async (files: File[]): Promise<{ title: string; content: string }[]> => {
  const results = await parseBatchDocxFiles(files);
  return results.map((result, index) => ({
    title: files[index].name.replace('.docx', ''),
    content: result.content
  })).filter(chapter => chapter.content.trim().length > 0);
};
