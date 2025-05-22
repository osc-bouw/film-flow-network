
import React, { createContext, useContext, useState, useEffect } from "react";
import { Media, MediaType } from "../types/media";
import { mediaData } from "../data/mediaData";
import { toast } from "sonner";

interface MediaContextType {
  allMedia: Media[];
  watchedMedia: Media[];
  unwatchedMedia: Media[];
  filteredMedia: Media[];
  activeFilter: 'all' | 'movies' | 'tvshows';
  watchStatus: 'all' | 'watched' | 'unwatched';
  setActiveFilter: (filter: 'all' | 'movies' | 'tvshows') => void;
  setWatchStatus: (status: 'all' | 'watched' | 'unwatched') => void;
  toggleWatched: (id: string) => void;
  updateRating: (id: string, rating: number) => void;
  importMedia: (mediaItems: Media[]) => void;
}

const STORAGE_KEY = 'mediatracker-data';

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [media, setMedia] = useState<Media[]>(() => {
    // Try to load from localStorage on initialization
    const savedMedia = localStorage.getItem(STORAGE_KEY);
    return savedMedia ? JSON.parse(savedMedia) : mediaData;
  });
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'tvshows'>('all');
  const [watchStatus, setWatchStatus] = useState<'all' | 'watched' | 'unwatched'>('all');

  // Save to localStorage whenever media changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
  }, [media]);

  const watchedMedia = media.filter(item => item.watched);
  const unwatchedMedia = media.filter(item => !item.watched);

  const filteredMedia = media.filter(item => {
    // Filter by media type
    if (activeFilter === 'movies' && item.type !== 'movie') return false;
    if (activeFilter === 'tvshows' && item.type !== 'tvshow') return false;
    
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

  return (
    <MediaContext.Provider 
      value={{ 
        allMedia: media, 
        watchedMedia, 
        unwatchedMedia, 
        filteredMedia,
        activeFilter,
        watchStatus,
        setActiveFilter,
        setWatchStatus,
        toggleWatched,
        updateRating,
        importMedia
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
