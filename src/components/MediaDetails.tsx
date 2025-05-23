import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMedia } from "../context/MediaContext";
import { Media } from "../types/media";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Star } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaCollections } from "./MediaCollections";

interface MediaDetailsProps {
  media?: Media;
}

export const MediaDetails = ({ media: propMedia }: MediaDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const { allMedia, toggleWatched, updateRating } = useMedia();
  const [media, setMedia] = useState<Media | undefined>(propMedia);

  useEffect(() => {
    if (id) {
      const foundMedia = allMedia.find((m) => m.id === id);
      setMedia(foundMedia);
    }
  }, [id, allMedia]);

  if (!media) {
    return <div className="py-8 px-4 container mx-auto">Loading...</div>;
  }

  const handleRating = (newRating: number) => {
    updateRating(media.id, newRating);
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
          <Rating value={media.rating || 0} onChange={handleRating} />
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

        <div>
          <h2 className="text-2xl font-semibold mb-2">Related Media</h2>
          <ScrollArea className="h-[200px] w-full rounded-md border">
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
        </div>
      </div>
    </div>
  );
};
