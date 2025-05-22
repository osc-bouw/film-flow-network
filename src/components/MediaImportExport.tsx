
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMedia } from "../context/MediaContext";
import { Upload, Download, FileJson } from "lucide-react";
import { toast } from "sonner";

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
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedMedia = JSON.parse(content);
        
        if (Array.isArray(importedMedia)) {
          importMedia(importedMedia);
          toast.success(`Imported ${importedMedia.length} media items`);
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
          <Upload className="h-4 w-4" /> Import
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
