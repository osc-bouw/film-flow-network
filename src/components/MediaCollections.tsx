
import { useState } from "react";
import { useMedia } from "../context/MediaContext";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaCollectionsProps {
  mediaId: string;
}

export const MediaCollections = ({ mediaId }: MediaCollectionsProps) => {
  const { collections, addToCollection, removeFromCollection } = useMedia();
  const [open, setOpen] = useState(false);

  const isInCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.mediaIds.includes(mediaId) : false;
  };

  const handleToggleCollection = (collectionId: string) => {
    if (isInCollection(collectionId)) {
      removeFromCollection(collectionId, mediaId);
    } else {
      addToCollection(collectionId, mediaId);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Plus className="mr-2 h-4 w-4" />
          Collections
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Add to Collection</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {collections.length === 0 ? (
          <DropdownMenuItem disabled>No collections available</DropdownMenuItem>
        ) : (
          collections.map(collection => (
            <DropdownMenuItem
              key={collection.id}
              onClick={() => handleToggleCollection(collection.id)}
              className="flex items-center justify-between"
            >
              {collection.name}
              {isInCollection(collection.id) && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
