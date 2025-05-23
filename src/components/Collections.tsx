import { useState } from "react";
import { useMedia } from "../context/MediaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, FolderPlus, SectionIcon } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Collections = () => {
  const { 
    collections, 
    createCollection, 
    deleteCollection, 
    activeCollection, 
    setActiveCollection,
    allMedia
  } = useMedia();
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName);
      setNewCollectionName("");
      setIsDialogOpen(false);
    }
  };

  const getCollectionCount = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.mediaIds.length : 0;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Collections</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>New Collection</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Collections help you organize your media by themes, franchises, or any grouping you prefer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollection}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg">
          <SectionIcon className="mx-auto h-12 w-12 text-gray-500 mb-2" />
          <p className="text-muted-foreground">No collections yet.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create collections to organize your media by themes or franchises.
          </p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Collection
          </Button>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {collections.map((collection) => (
            <AccordionItem key={collection.id} value={collection.id}>
              <div className="flex items-center justify-between">
                <Button
                  variant={activeCollection === collection.id ? "default" : "ghost"}
                  className={`flex-1 justify-start h-auto py-3 px-4 font-normal ${activeCollection === collection.id ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => setActiveCollection(activeCollection === collection.id ? null : collection.id)}
                >
                  <span className="truncate">{collection.name}</span>
                  <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                    {getCollectionCount(collection.id)}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete collection "${collection.name}"?`)) {
                      deleteCollection(collection.id);
                    }
                  }}
                  className="hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <AccordionContent className="pl-4">
                {collection.mediaIds.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {collection.mediaIds.map(mediaId => {
                      const mediaItem = allMedia.find(item => item.id === mediaId);
                      return mediaItem ? (
                        <div key={mediaId} className="text-sm text-muted-foreground">
                          {mediaItem.title}
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    No media in this collection yet.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
