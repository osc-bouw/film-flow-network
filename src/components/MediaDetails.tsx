
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMedia } from "../context/MediaContext";
import { Media } from "../types/media";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Star, Edit, Check, X, Plus, Trash2 } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaCollections } from "./MediaCollections";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface MediaDetailsProps {
  media?: Media;
}

export const MediaDetails = ({ media: propMedia }: MediaDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const { allMedia, toggleWatched, updateRating, updateRelatedMedia } = useMedia();
  const [media, setMedia] = useState<Media | undefined>(propMedia);
  const [editingRating, setEditingRating] = useState(false);
  const [editingRelated, setEditingRelated] = useState(false);
  const [selectedRelatedMedia, setSelectedRelatedMedia] = useState<string[]>([]);
  const [newRelatedId, setNewRelatedId] = useState("");

  useEffect(() => {
    if (id) {
      const foundMedia = allMedia.find((m) => m.id === id);
      setMedia(foundMedia);
      if (foundMedia) {
        setSelectedRelatedMedia(foundMedia.relatedMedia);
      }
    }
  }, [id, allMedia]);

  if (!media) {
    return <div className="py-8 px-4 container mx-auto">Loading...</div>;
  }

  const handleRating = (newRating: number) => {
    updateRating(media.id, newRating);
  };
  
  const handleSaveRelatedMedia = () => {
    updateRelatedMedia(media.id, selectedRelatedMedia);
    setEditingRelated(false);
  };
  
  const handleAddRelatedMedia = () => {
    if (!newRelatedId) {
      toast.error("Please select media to add");
      return;
    }
    
    if (newRelatedId === media.id) {
      toast.error("Cannot add the same media as related");
      return;
    }
    
    if (selectedRelatedMedia.includes(newRelatedId)) {
      toast.error("This media is already in the related list");
      return;
    }
    
    setSelectedRelatedMedia([...selectedRelatedMedia, newRelatedId]);
    setNewRelatedId("");
  };
  
  const handleRemoveRelatedMedia = (relatedId: string) => {
    setSelectedRelatedMedia(selectedRelatedMedia.filter(id => id !== relatedId));
  };
  
  const getAvailableMedia = () => {
    return allMedia.filter(m => m.id !== media.id && !selectedRelatedMedia.includes(m.id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-8">
      <div className="w-full lg:w-1/3 flex justify-center">
        <img
          src={media.poster}
          alt={media.title}
          className="rounded-lg shadow-md max-w-full h-auto object-cover"
          style={{ maxHeight: '500px' }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold">{media.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={media.watched ? "default" : "outline"}
              size="sm"
              onClick={() => toggleWatched(media.id)}
            >
              {media.watched ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Watched
                </>
              ) : (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Not Watched
                </>
              )}
            </Button>
            <MediaCollections mediaId={media.id} />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          {editingRating ? (
            <div className="flex items-center gap-2">
              <Rating value={media.rating || 0} onChange={handleRating} />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setEditingRating(false)} 
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Rating value={media.rating || 0} onChange={undefined} />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setEditingRating(true)} 
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          <span className="text-sm text-muted-foreground">
            {media.rating ? `${media.rating} / 5` : "Not rated"}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground">{media.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {media.genres.map((genre) => (
              <Badge key={genre}>{genre}</Badge>
            ))}
          </div>
        </div>

        {media.director && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Director</h2>
            <p className="text-muted-foreground">{media.director}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">Related Media</h2>
            {editingRelated ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedRelatedMedia(media.relatedMedia);
                    setEditingRelated(false);
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveRelatedMedia}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Save
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingRelated(true)}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit Related
              </Button>
            )}
          </div>

          {editingRelated ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={newRelatedId} onValueChange={setNewRelatedId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select media to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableMedia().map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title} ({item.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={handleAddRelatedMedia} 
                  disabled={!newRelatedId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4">
                  {selectedRelatedMedia.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedRelatedMedia.map((relatedId) => {
                        const relatedMedia = allMedia.find((m) => m.id === relatedId);
                        return relatedMedia ? (
                          <li key={relatedId} className="flex items-center justify-between">
                            <span>{relatedMedia.title}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:text-destructive"
                              onClick={() => handleRemoveRelatedMedia(relatedId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No related media added yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4">
                {media.relatedMedia.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {media.relatedMedia.map((relatedId) => {
                      const relatedMedia = allMedia.find((m) => m.id === relatedId);
                      return relatedMedia ? (
                        <li key={relatedId}>{relatedMedia.title}</li>
                      ) : null;
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No related media found.</p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};
