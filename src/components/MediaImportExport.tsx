
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMedia } from "../context/MediaContext";
import { Upload, Download, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Media } from "../types/media";

export const MediaImportExport = () => {
  const { allMedia, importMedia } = useMedia();
  const [isUploading, setIsUploading] = useState(false);
  
  const handleExport = () => {
    try {
      // Create a blob with the JSON data
      const data = JSON.stringify(allMedia, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mediatracker_export_${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast("Media library exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export media library");
    }
  };
  
  const fetchMovieImage = async (title: string, year: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/${title.includes("Season") ? "tv" : "movie"}?api_key=8e5f5e1f2b07e5ba6f365c8019fd13ec&query=${encodeURIComponent(title)}&year=${year}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to fetch movie image:", error);
      return null;
    }
  };
  
  const processImportedMedia = async (mediaItems: Media[]) => {
    let processed = 0;
    let withImages = 0;
    const processedMedia: Media[] = [];
    
    // Process items sequentially to avoid rate limiting
    for (const item of mediaItems) {
      processed++;
      
      // Check if the media item has a valid image
      const hasValidImage = item.poster && 
        !item.poster.includes("placehold.co") && 
        !item.poster.includes("placeholder");
      
      if (!hasValidImage) {
        // Try to fetch an image
        const imageUrl = await fetchMovieImage(item.title, item.year);
        
        if (imageUrl) {
          item.poster = imageUrl;
          withImages++;
        } else {
          // Use a placeholder if no image is found
          item.poster = "https://placehold.co/300x450/1c1e25/white?text=No+Image";
        }
      } else {
        withImages++;
      }
      
      processedMedia.push(item);
      
      // Update toast for progress
      if (processed % 5 === 0 || processed === mediaItems.length) {
        toast(`Processing: ${processed}/${mediaItems.length} items`);
      }
    }
    
    toast.success(`Processed ${processed} items, found images for ${withImages} items`);
    return processedMedia;
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    toast("Starting import process...");
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedMedia = JSON.parse(content);
        
        if (Array.isArray(importedMedia)) {
          toast(`Found ${importedMedia.length} media items, processing...`);
          
          // Process media items to fetch missing images
          const processedMedia = await processImportedMedia(importedMedia);
          
          // Import the processed media
          importMedia(processedMedia);
          toast.success(`Imported ${processedMedia.length} media items`);
        } else {
          toast.error("Invalid import file format");
        }
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Failed to import media library");
      } finally {
        setIsUploading(false);
        // Reset file input
        event.target.value = "";
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading file");
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" /> Export
      </Button>
      
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isUploading}
          onClick={() => document.getElementById("import-media")?.click()}
        >
          {isUploading ? "Processing..." : <><Upload className="h-4 w-4" /> Import</>}
        </Button>
        <input
          id="import-media"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={() => toast.info("Media data is stored in your browser's local storage")}
      >
        <FileJson className="h-4 w-4" />
      </Button>
    </div>
  );
};
