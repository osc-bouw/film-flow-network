
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMedia } from "../context/MediaContext";
import { Media } from "../types/media";
import { Eye, EyeOff, Star } from "lucide-react";

interface MediaCardProps {
  media: Media;
}

export const MediaCard = ({ media }: MediaCardProps) => {
  const { toggleWatched } = useMedia();
  
  return (
    <Card className="overflow-hidden bg-cinema-card border-gray-800 media-card">
      <Link to={`/media/${media.id}`}>
        <div className="relative">
          <img 
            src={media.poster} 
            alt={media.title} 
            className="media-card-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/300x450/1c1e25/white?text=No+Image";
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge 
              className={media.type === 'movie' ? 'bg-cinema-accent' : 'bg-cinema-highlight'}
            >
              {media.type === 'movie' ? 'Movie' : 'TV Show'}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/media/${media.id}`}>
          <h2 className="text-lg font-bold mb-1 hover:text-primary transition-colors">{media.title}</h2>
        </Link>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400">{media.year}</p>
          {media.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm">{media.rating}/5</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {media.genres.slice(0, 3).map((genre, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className={media.watched ? "text-green-500 border-green-500/20" : "text-muted-foreground"}
          onClick={() => toggleWatched(media.id)}
        >
          {media.watched ? (
            <><Eye className="h-4 w-4 mr-2" /> Watched</>
          ) : (
            <><EyeOff className="h-4 w-4 mr-2" /> Not watched</>
          )}
        </Button>
        
        <Link to={`/media/${media.id}`}>
          <Button size="sm" variant="secondary">Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
