
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import Login from "./pages/Login";

// Novel routes
import CreateNovel from "./pages/novels/Create";
import EditNovel from "./pages/novels/Edit";
import NovelDetail from "./pages/novels/Detail";

// Chapter routes
import CreateChapter from "./pages/novels/chapters/Create";
import EditChapter from "./pages/novels/chapters/Edit";
import ReadChapter from "./pages/novels/chapters/Read";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
          
          {/* Novel routes */}
          <Route path="/novels/create" element={<CreateNovel />} />
          <Route path="/novels/:id" element={<NovelDetail />} />
          <Route path="/novels/:id/edit" element={<EditNovel />} />
          
          {/* Chapter routes */}
          <Route path="/novels/:novelId/chapters/create" element={<CreateChapter />} />
          <Route path="/novels/:novelId/chapters/:chapterId" element={<ReadChapter />} />
          <Route path="/novels/:novelId/chapters/:chapterId/edit" element={<EditChapter />} />
          
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
