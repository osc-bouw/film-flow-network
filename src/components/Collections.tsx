
import { useState } from "react";
import { useMedia } from "../context/MediaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, FolderPlus, SectionIcon, Image } from "lucide-react";
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
    allMedia,
    updateCollection
  } = useMedia();
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionImage, setNewCollectionImage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName, newCollectionImage || undefined);
      setNewCollectionName("");
      setNewCollectionImage("");
      setIsDialogOpen(false);
    }
  };

  const handleEditCollection = (id: string) => {
    const collection = collections.find(c => c.id === id);
    if (collection) {
      setEditingCollection(id);
      setNewCollectionName(collection.name);
      setNewCollectionImage(collection.image || "");
      setIsDialogOpen(true);
    }
  };

  const handleUpdateCollection = () => {
    if (editingCollection && newCollectionName.trim()) {
      updateCollection(editingCollection, {
        name: newCollectionName,
        image: newCollectionImage || undefined
      });
      setNewCollectionName("");
      setNewCollectionImage("");
      setEditingCollection(null);
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
              <DialogTitle>
                {editingCollection ? "Edit Collection" : "Create New Collection"}
              </DialogTitle>
              <DialogDescription>
                Collections help you organize your media by themes, franchises, or any grouping you prefer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <label htmlFor="collection-name" className="text-sm font-medium mb-1 block">
                  Collection Name
                </label>
                <Input
                  id="collection-name"
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="collection-image" className="text-sm font-medium mb-1 block">
                  Collection Image URL (optional)
                </label>
                <Input
                  id="collection-image"
                  placeholder="https://example.com/image.jpg"
                  value={newCollectionImage}
                  onChange={(e) => setNewCollectionImage(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {newCollectionImage && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Image Preview:</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border border-gray-700">
                    <img 
                      src={newCollectionImage} 
                      alt="Collection preview" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/png?text=Invalid+Image';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingCollection(null);
                setNewCollectionName("");
                setNewCollectionImage("");
              }}>
                Cancel
              </Button>
              
              <Button onClick={editingCollection ? handleUpdateCollection : handleCreateCollection}>
                <FolderPlus className="mr-2 h-4 w-4" />
                {editingCollection ? "Update Collection" : "Create Collection"}
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
                  <div className="flex items-center gap-2">
                    {collection.image ? (
                      <div className="h-6 w-6 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={collection.image}
                          alt={collection.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <SectionIcon size={16} />
                    )}
                    <span className="truncate">{collection.name}</span>
                  </div>
                  <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                    {getCollectionCount(collection.id)}
                  </span>
                </Button>
                
                <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCollection(collection.id);
                    }}
                    className="hover:text-primary"
                  >
                    <Image size={16} />
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
