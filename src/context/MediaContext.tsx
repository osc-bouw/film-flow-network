
import React, { createContext, useContext, useState } from "react";
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
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [media, setMedia] = useState<Media[]>(mediaData);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'tvshows'>('all');
  const [watchStatus, setWatchStatus] = useState<'all' | 'watched' | 'unwatched'>('all');

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
        updateRating
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
