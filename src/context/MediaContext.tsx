
import React, { createContext, useContext, useState, useEffect } from "react";
import { Media, MediaType, Collection } from "../types/media";
// In the static version of the app we keep all data in the browser.
// No remote database is used, so we load and persist to localStorage.
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
  addMedia: (media: Media) => void;
  deleteMedia: (id: string) => void;
  importMedia: (mediaItems: Media[]) => void;
  clearAllMedia: () => void;
  createCollection: (name: string, image?: string) => Promise<string | undefined>;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, mediaId: string) => void;
  removeFromCollection: (collectionId: string, mediaId: string) => void;
  setActiveCollection: (collectionId: string | null) => void;
  updateRelatedMedia: (id: string, relatedMedia: string[]) => void;
  loading: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'tvshows' | 'collections'>('all');
  const [watchStatus, setWatchStatus] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage or fallback to sample data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const storedMedia = localStorage.getItem('media');
      const storedCollections = localStorage.getItem('collections');
      setMedia(storedMedia ? JSON.parse(storedMedia) : mediaData);
      setCollections(storedCollections ? JSON.parse(storedCollections) : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Persist changes to localStorage whenever media or collections change
  useEffect(() => {
    localStorage.setItem('media', JSON.stringify(media));
  }, [media]);

  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(collections));
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
    const mediaItem = media.find(item => item.id === id);
    if (!mediaItem) return;

    const newWatchedStatus = !mediaItem.watched;

    setMedia(prevMedia =>
      prevMedia.map(item =>
        item.id === id ? { ...item, watched: newWatchedStatus } : item
      )
    );

    toast(`${mediaItem.title} marked as ${newWatchedStatus ? 'watched' : 'unwatched'}`);
  };

  const updateRating = (id: string, rating: number) => {
    setMedia(prevMedia =>
      prevMedia.map(item =>
        item.id === id ? { ...item, rating } : item
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
        item.id === id ? { ...item, relatedMedia } : item
      )
    );

    toast(`Updated related media for ${media.find(item => item.id === id)?.title}`);
  };

  const addMedia = (newMedia: Media) => {
    if (media.some(m => m.title === newMedia.title && m.year === newMedia.year)) {
      toast.error("A media item with this title and year already exists");
      return;
    }

    const item: Media = {
      ...newMedia,
      id: newMedia.id || crypto.randomUUID(),
      relatedMedia: newMedia.relatedMedia || []
    };

    setMedia(prevMedia => [item, ...prevMedia]);
    toast.success(`Added ${newMedia.title} to your library`);
  };

  const deleteMedia = (id: string) => {
    setMedia(prev =>
      prev
        .filter(item => item.id !== id)
        .map(item => ({
          ...item,
          relatedMedia: item.relatedMedia.filter(rid => rid !== id)
        }))
    );

    setCollections(prev =>
      prev.map(collection => ({
        ...collection,
        mediaIds: collection.mediaIds.filter(mid => mid !== id)
      }))
    );

    toast.success('Media deleted');
  };

  const importMedia = (mediaItems: Media[]) => {
    const validatedMedia = mediaItems.filter(item => {
      return (
        item.title &&
        (item.type === 'movie' || item.type === 'tvshow') &&
        typeof item.year === 'number' &&
        typeof item.watched === 'boolean' &&
        item.description &&
        Array.isArray(item.genres)
      );
    });

    if (validatedMedia.length !== mediaItems.length) {
      toast.warning(`Filtered out ${mediaItems.length - validatedMedia.length} invalid items`);
    }

    setMedia(validatedMedia.map(m => ({
      ...m,
      id: m.id || crypto.randomUUID(),
      relatedMedia: m.relatedMedia || []
    })));

    setCollections([]);
    setActiveCollection(null);
    toast.success('Media imported successfully');
  };

  const clearAllMedia = () => {
    setMedia([]);
    setCollections([]);
    setActiveCollection(null);
    localStorage.removeItem('media');
    localStorage.removeItem('collections');
    toast.success("All media and collections cleared");
  };

  const createCollection = async (name: string, image?: string) => {
    if (!name.trim()) {
      toast.error("Collection name cannot be empty");
      return;
    }

    if (collections.some(c => c.name === name)) {
      toast.error("A collection with this name already exists");
      return;
    }

    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      mediaIds: [],
      image
    };

    setCollections(prev => [newCollection, ...prev]);
    toast.success(`Created collection: ${name}`);
    return newCollection.id;
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
        addMedia,
        deleteMedia,
        importMedia,
        clearAllMedia,
        createCollection,
        updateCollection,
        deleteCollection,
        addToCollection,
        removeFromCollection,
        setActiveCollection,
        updateRelatedMedia,
        loading
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
