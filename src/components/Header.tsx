
import { Link } from "react-router-dom";
import { useMedia } from "../context/MediaContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv } from "lucide-react";

export const Header = () => {
  const { activeFilter, setActiveFilter, watchStatus, setWatchStatus } = useMedia();

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-black/60 border-b border-gray-800 py-4 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-cinema animate-pulse-gentle"></div>
            <h1 className="text-2xl font-bold bg-gradient-cinema text-transparent bg-clip-text">
              MediaTracker
            </h1>
          </Link>
          
          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="movies" className="flex items-center gap-1">
                  <Film size={16} /> Movies
                </TabsTrigger>
                <TabsTrigger value="tvshows" className="flex items-center gap-1">
                  <Tv size={16} /> TV Shows
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs value={watchStatus} onValueChange={(v) => setWatchStatus(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="watched">Watched</TabsTrigger>
                <TabsTrigger value="unwatched">To Watch</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <nav className="flex gap-4">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/graph" className="text-sm font-medium hover:text-primary transition-colors">
              Media Graph
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
