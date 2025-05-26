import React, { createContext, useContext, useState, useEffect } from "react";
import { Media, MediaType, Collection } from "../types/media";
import { mediaData } from "../data/mediaData";
import { toast } from "sonner";

interface MediaContextType {
  allMedia: Media[];
  watchedMedia: Media[];
  unwatchedMedia: Media[];
  filteredMedia: Media[];
  activeFilter: 'all' | 'movies' | 'tvshows' | 'collections';
  watchStatus: 'all' | 'watched' | 'unwatched';
  collections: Collection[];
  activeCollection: string | null;
  setActiveFilter: (filter: 'all' | 'movies' | 'tvshows' | 'collections') => void;
  setWatchStatus: (status: 'all' | 'watched' | 'unwatched') => void;
  toggleWatched: (id: string) => void;
  updateRating: (id: string, rating: number) => void;
  importMedia: (mediaItems: Media[]) => void;
  clearAllMedia: () => void;
  createCollection: (name: string, image?: string) => string | undefined;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, mediaId: string) => void;
  removeFromCollection: (collectionId: string, mediaId: string) => void;
  setActiveCollection: (collectionId: string | null) => void;
  updateRelatedMedia: (id: string, relatedMedia: string[]) => void;
}

const STORAGE_KEY = 'mediatracker-data';
const COLLECTIONS_KEY = 'mediatracker-collections';

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [media, setMedia] = useState<Media[]>(() => {
    // Try to load from localStorage on initialization
    const savedMedia = localStorage.getItem(STORAGE_KEY);
    return savedMedia ? JSON.parse(savedMedia) : mediaData;
  });
  
  const [collections, setCollections] = useState<Collection[]>(() => {
    const savedCollections = localStorage.getItem(COLLECTIONS_KEY);
    return savedCollections ? JSON.parse(savedCollections) : [
      {
        id: "marvel",
        name: "Marvel Movies",
        mediaIds: ["1", "2"],
        image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1"
      },
      {
        id: "star-wars",
        name: "Star Wars",
        mediaIds: ["7"],
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
      }
    ];
  });
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'tvshows' | 'collections'>('all');
  const [watchStatus, setWatchStatus] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  // Save to localStorage whenever media or collections change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
  }, [media]);
  
  useEffect(() => {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  }, [collections]);

  const watchedMedia = media.filter(item => item.watched);
  const unwatchedMedia = media.filter(item => !item.watched);

  const filteredMedia = media.filter(item => {
    // Filter by collection first if one is active
    if (activeCollection) {
      const collection = collections.find(c => c.id === activeCollection);
      if (!collection || !collection.mediaIds.includes(item.id)) return false;
    }
    
    // Filter by media type
    if (activeFilter === 'movies' && item.type !== 'movie') return false;
    if (activeFilter === 'tvshows' && item.type !== 'tvshow') return false;
    
    // If collections filter is active, show nothing (collections are handled separately)
    if (activeFilter === 'collections') return false;
    
    // Filter by watch status
    if (watchStatus === 'watched' && !item.watched) return false;
    if (watchStatus === 'unwatched' && item.watched) return false;
    
    return true;
  });

  const toggleWatched = (id: string) => {
    setMedia(prevMedia => 
      prevMedia.map(item => 
        item.id === id 
          ? { ...item, watched: !item.watched } 
          : item
      )
    );
    
    const mediaItem = media.find(item => item.id === id);
    if (mediaItem) {
      toast(`${mediaItem.title} marked as ${mediaItem.watched ? 'unwatched' : 'watched'}`);
    }
  };

  const updateRating = (id: string, rating: number) => {
    setMedia(prevMedia => 
      prevMedia.map(item => 
        item.id === id 
          ? { ...item, rating } 
          : item
      )
    );
    
    const mediaItem = media.find(item => item.id === id);
    if (mediaItem) {
      toast(`Rated ${mediaItem.title} ${rating} stars`);
    }
  };
  
  const updateRelatedMedia = (id: string, relatedMedia: string[]) => {
    setMedia(prevMedia =>
      prevMedia.map(item =>
        item.id === id
          ? { ...item, relatedMedia }
          : item
      )
    );
    
    toast(`Updated related media for ${media.find(item => item.id === id)?.title}`);
  };

  const importMedia = (mediaItems: Media[]) => {
    // Validate imported media
    const validatedMedia = mediaItems.filter(item => {
      return (
        item.id &&
        item.title &&
        (item.type === 'movie' || item.type === 'tvshow') &&
        typeof item.year === 'number' &&
        typeof item.watched === 'boolean' &&
        item.description &&
        Array.isArray(item.genres) &&
        Array.isArray(item.relatedMedia)
      );
    });

    if (validatedMedia.length !== mediaItems.length) {
      toast.warning(`Filtered out ${mediaItems.length - validatedMedia.length} invalid items`);
    }

    setMedia(validatedMedia);
  };

  const clearAllMedia = () => {
    setMedia([]);
    setCollections([]);
    setActiveCollection(null);
    toast.success("All media and collections cleared");
  };

  const createCollection = (name: string, image?: string) => {
    if (!name.trim()) {
      toast.error("Collection name cannot be empty");
      return;
    }
    
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    if (collections.some(collection => collection.id === id)) {
      toast.error("A collection with this name already exists");
      return;
    }
    
    const newCollection: Collection = {
      id,
      name,
      mediaIds: [],
      image,
    };
    
    setCollections([...collections, newCollection]);
    toast.success(`Created collection: ${name}`);
    return id;
  };
  
  const updateCollection = (id: string, updates: Partial<Collection>) => {
    setCollections(collections.map(collection => 
      collection.id === id ? { ...collection, ...updates } : collection
    ));
    
    toast.success(`Updated collection: ${updates.name || collections.find(c => c.id === id)?.name}`);
  };
  
  const deleteCollection = (id: string) => {
    setCollections(collections.filter(collection => collection.id !== id));
    if (activeCollection === id) {
      setActiveCollection(null);
    }
    toast.success("Collection deleted");
  };
  
  const addToCollection = (collectionId: string, mediaId: string) => {
    setCollections(collections.map(collection => {
      if (collection.id === collectionId && !collection.mediaIds.includes(mediaId)) {
        return {
          ...collection,
          mediaIds: [...collection.mediaIds, mediaId],
        };
      }
      return collection;
    }));
    
    const collection = collections.find(c => c.id === collectionId);
    const mediaItem = media.find(m => m.id === mediaId);
    
    if (collection && mediaItem) {
      toast.success(`Added ${mediaItem.title} to ${collection.name}`);
    }
  };
  
  const removeFromCollection = (collectionId: string, mediaId: string) => {
    setCollections(collections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          mediaIds: collection.mediaIds.filter(id => id !== mediaId),
        };
      }
      return collection;
    }));
    
    const collection = collections.find(c => c.id === collectionId);
    const mediaItem = media.find(m => m.id === mediaId);
    
    if (collection && mediaItem) {
      toast.success(`Removed ${mediaItem.title} from ${collection.name}`);
    }
  };

  return (
    <MediaContext.Provider 
      value={{ 
        allMedia: media, 
        watchedMedia, 
        unwatchedMedia, 
        filteredMedia,
        activeFilter,
        watchStatus,
        collections,
        activeCollection,
        setActiveFilter,
        setWatchStatus,
        toggleWatched,
        updateRating,
        importMedia,
        clearAllMedia,
        createCollection,
        updateCollection,
        deleteCollection,
        addToCollection,
        removeFromCollection,
        setActiveCollection,
        updateRelatedMedia
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};
