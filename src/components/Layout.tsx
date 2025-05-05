
import React from "react";
import Navbar from "./Navbar";
import SEO from "./SEO";
import { useToast } from "@/hooks/use-toast";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen flex flex-col bg-novel-100">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="flex-1 container py-8 px-4">{children}</main>
      <footer className="bg-novel-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">NovelVerse</h3>
              <p className="text-novel-300">
                Discover and share amazing stories from writers around the world.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-novel-300 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/novels/create" className="text-novel-300 hover:text-white transition-colors">
                    Create Novel
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-novel-700 text-center text-novel-400">
            <p>© 2025 NovelVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
