
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMediaById, getRelatedMedia } from "../data/mediaData";
import { useMedia } from "../context/MediaContext";
import { MediaGrid } from "./MediaGrid";
import { Eye, EyeOff, Star, ArrowLeft } from "lucide-react";

export const MediaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toggleWatched, updateRating } = useMedia();
  const [showRelated, setShowRelated] = useState(true);
  
  const media = id ? getMediaById(id) : undefined;
  const relatedMedia = id ? getRelatedMedia(id) : [];
  
  if (!media) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl">Media not found</h2>
        <Link to="/">
          <Button className="mt-4">Go back to home</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Link to="/" className="inline-flex items-center mb-6 hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all media
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <img 
              src={media.poster} 
              alt={media.title} 
              className="w-full rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/300x450/1c1e25/white?text=No+Image";
              }}
            />
            
            <div className="mt-6 flex flex-wrap gap-2">
              <Button 
                className={media.watched ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => toggleWatched(media.id)}
              >
                {media.watched ? (
                  <><Eye className="h-4 w-4 mr-2" /> Watched</>
                ) : (
                  <><EyeOff className="h-4 w-4 mr-2" /> Mark as watched</>
                )}
              </Button>
              
              <Link to="/graph">
                <Button variant="outline">View in Graph</Button>
              </Link>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Rate this {media.type}</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button 
                    key={star} 
                    variant="ghost" 
                    size="sm"
                    className={`p-1 ${media.rating && star <= media.rating ? "text-yellow-500" : "text-gray-500"}`}
                    onClick={() => updateRating(media.id, star)}
                  >
                    <Star className={`h-6 w-6 ${media.rating && star <= media.rating ? "fill-yellow-500" : ""}`} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h1 className="text-3xl font-bold">{media.title}</h1>
            <Badge 
              className={media.type === 'movie' ? 'bg-cinema-accent' : 'bg-cinema-highlight'}
            >
              {media.type === 'movie' ? 'Movie' : 'TV Show'}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mb-6 text-muted-foreground">
            <span>{media.year}</span>
            {media.director && <span>Director: {media.director}</span>}
          </div>
          
          <Card className="mb-8 bg-cinema-card border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{media.description}</p>
              
              <Separator className="my-6 bg-gray-800" />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {media.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {relatedMedia.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Related Media</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowRelated(!showRelated)}
                >
                  {showRelated ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showRelated && <MediaGrid media={relatedMedia} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
