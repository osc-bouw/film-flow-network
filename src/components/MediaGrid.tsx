
import { Media } from "../types/media";
import { MediaCard } from "./MediaCard";

interface MediaGridProps {
  media: Media[];
}

export const MediaGrid = ({ media }: MediaGridProps) => {
  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-xl text-muted-foreground">No media items found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {media.map((item) => (
        <MediaCard key={item.id} media={item} />
      ))}
    </div>
  );
};
