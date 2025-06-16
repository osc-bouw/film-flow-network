
import React, { createContext, useContext, useState, useEffect } from "react";
import { Media, MediaType, Collection } from "../types/media";
import { supabase } from "@/integrations/supabase/client";
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

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadMedia(), loadCollections()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database format to app format
      const transformedMedia: Media[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as MediaType,
        year: item.year,
        poster: item.poster || '',
        rating: item.rating,
        watched: item.watched,
        description: item.description || '',
        genres: item.genres || [],
        director: item.director,
        relatedMedia: [] // Will be loaded separately
      }));

      // Load related media for each item
      for (const mediaItem of transformedMedia) {
        const { data: relatedData, error: relatedError } = await supabase
          .from('related_media')
          .select('related_media_id')
          .eq('media_id', mediaItem.id);

        if (!relatedError && relatedData) {
          mediaItem.relatedMedia = relatedData.map(r => r.related_media_id);
        }
      }

      setMedia(transformedMedia);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (collectionsError) throw collectionsError;

      const transformedCollections: Collection[] = [];

      for (const collection of collectionsData || []) {
        const { data: mediaData, error: mediaError } = await supabase
          .from('collection_media')
          .select('media_id')
          .eq('collection_id', collection.id);

        if (!mediaError) {
          transformedCollections.push({
            id: collection.id,
            name: collection.name,
            mediaIds: (mediaData || []).map(m => m.media_id),
            image: collection.image
          });
        }
      }

      setCollections(transformedCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

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

  const toggleWatched = async (id: string) => {
    try {
      const mediaItem = media.find(item => item.id === id);
      if (!mediaItem) return;

      const newWatchedStatus = !mediaItem.watched;

      const { error } = await supabase
        .from('media')
        .update({ watched: newWatchedStatus })
        .eq('id', id);

      if (error) throw error;

      setMedia(prevMedia => 
        prevMedia.map(item => 
          item.id === id 
            ? { ...item, watched: newWatchedStatus } 
            : item
        )
      );
      
      toast(`${mediaItem.title} marked as ${newWatchedStatus ? 'watched' : 'unwatched'}`);
    } catch (error) {
      console.error('Error toggling watched status:', error);
      toast.error('Failed to update watch status');
    }
  };

  const updateRating = async (id: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('media')
        .update({ rating })
        .eq('id', id);

      if (error) throw error;

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
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update rating');
    }
  };
  
  const updateRelatedMedia = async (id: string, relatedMedia: string[]) => {
    try {
      // First, delete existing related media
      await supabase
        .from('related_media')
        .delete()
        .eq('media_id', id);

      // Then, insert new related media
      if (relatedMedia.length > 0) {
        const relatedMediaInserts = relatedMedia.map(relatedId => ({
          media_id: id,
          related_media_id: relatedId
        }));

        const { error } = await supabase
          .from('related_media')
          .insert(relatedMediaInserts);

        if (error) throw error;
      }

      setMedia(prevMedia =>
        prevMedia.map(item =>
          item.id === id
            ? { ...item, relatedMedia }
            : item
        )
      );
      
      toast(`Updated related media for ${media.find(item => item.id === id)?.title}`);
    } catch (error) {
      console.error('Error updating related media:', error);
      toast.error('Failed to update related media');
    }
  };

  const addMedia = async (newMedia: Media) => {
    try {
      // Check if media with same title and year already exists
      const { data: existingMedia, error: checkError } = await supabase
        .from('media')
        .select('id')
        .eq('title', newMedia.title)
        .eq('year', newMedia.year)
        .limit(1);

      if (checkError) throw checkError;

      if (existingMedia && existingMedia.length > 0) {
        toast.error("A media item with this title and year already exists");
        return;
      }

      const { data, error } = await supabase
        .from('media')
        .insert({
          title: newMedia.title,
          type: newMedia.type,
          year: newMedia.year,
          poster: newMedia.poster,
          rating: newMedia.rating,
          watched: newMedia.watched,
          description: newMedia.description,
          genres: newMedia.genres,
          director: newMedia.director
        })
        .select()
        .single();

      if (error) throw error;

      const transformedMedia: Media = {
        id: data.id,
        title: data.title,
        type: data.type as MediaType,
        year: data.year,
        poster: data.poster || '',
        rating: data.rating,
        watched: data.watched,
        description: data.description || '',
        genres: data.genres || [],
        director: data.director,
        relatedMedia: []
      };

      setMedia(prevMedia => [transformedMedia, ...prevMedia]);
      toast.success(`Added ${newMedia.title} to your library`);
    } catch (error) {
      console.error('Error adding media:', error);
      toast.error('Failed to add media');
    }
  };

  const importMedia = async (mediaItems: Media[]) => {
    try {
      // Validate imported media
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

      // Clear existing data and insert new data
      await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (validatedMedia.length > 0) {
        const mediaInserts = validatedMedia.map(item => ({
          title: item.title,
          type: item.type,
          year: item.year,
          poster: item.poster,
          rating: item.rating,
          watched: item.watched,
          description: item.description,
          genres: item.genres,
          director: item.director
        }));

        const { error } = await supabase
          .from('media')
          .insert(mediaInserts);

        if (error) throw error;
      }

      await loadMedia();
      toast.success('Media imported successfully');
    } catch (error) {
      console.error('Error importing media:', error);
      toast.error('Failed to import media');
    }
  };

  const clearAllMedia = async () => {
    try {
      await supabase.from('collection_media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('related_media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      setMedia([]);
      setCollections([]);
      setActiveCollection(null);
      toast.success("All media and collections cleared");
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    }
  };

  const createCollection = async (name: string, image?: string) => {
    try {
      if (!name.trim()) {
        toast.error("Collection name cannot be empty");
        return;
      }
      
      // Check if collection with this name already exists
      const { data: existingCollection, error: checkError } = await supabase
        .from('collections')
        .select('id')
        .eq('name', name)
        .limit(1);

      if (checkError) throw checkError;

      if (existingCollection && existingCollection.length > 0) {
        toast.error("A collection with this name already exists");
        return;
      }

      const { data, error } = await supabase
        .from('collections')
        .insert({
          name,
          image
        })
        .select()
        .single();

      if (error) throw error;

      const newCollection: Collection = {
        id: data.id,
        name: data.name,
        mediaIds: [],
        image: data.image
      };

      setCollections(prev => [newCollection, ...prev]);
      toast.success(`Created collection: ${name}`);
      return data.id;
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };
  
  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    try {
      const { error } = await supabase
        .from('collections')
        .update({
          name: updates.name,
          image: updates.image
        })
        .eq('id', id);

      if (error) throw error;

      setCollections(collections.map(collection => 
        collection.id === id ? { ...collection, ...updates } : collection
      ));
      
      toast.success(`Updated collection: ${updates.name || collections.find(c => c.id === id)?.name}`);
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('Failed to update collection');
    }
  };
  
  const deleteCollection = async (id: string) => {
    try {
      // Delete collection (cascade will handle collection_media)
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCollections(collections.filter(collection => collection.id !== id));
      if (activeCollection === id) {
        setActiveCollection(null);
      }
      toast.success("Collection deleted");
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };
  
  const addToCollection = async (collectionId: string, mediaId: string) => {
    try {
      const { error } = await supabase
        .from('collection_media')
        .insert({
          collection_id: collectionId,
          media_id: mediaId
        });

      if (error) throw error;

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
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast.error('Failed to add to collection');
    }
  };
  
  const removeFromCollection = async (collectionId: string, mediaId: string) => {
    try {
      const { error } = await supabase
        .from('collection_media')
        .delete()
        .eq('collection_id', collectionId)
        .eq('media_id', mediaId);

      if (error) throw error;

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
    } catch (error) {
      console.error('Error removing from collection:', error);
      toast.error('Failed to remove from collection');
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
