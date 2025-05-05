
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { toast } from "sonner";

// These will be replaced with your actual keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Supabase credentials are missing. Please check your environment variables.");
      throw new Error("Supabase credentials are missing");
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabaseInstance;
};

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey);
};

// Helper function to check if crypto API is available for UUID generation
export const isCryptoAvailable = (): boolean => {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
};

// Helper to handle Supabase errors
export const handleSupabaseError = (error: any, customMessage: string = "An error occurred"): never => {
  console.error("Supabase error:", error);
  toast.error(`${customMessage}: ${error.message || error}`);
  throw error;
};