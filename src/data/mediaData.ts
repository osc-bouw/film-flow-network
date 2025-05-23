
import { Media } from "../types/media";

// Sample media data
export const mediaData: Media[] = [
  {
    id: "1",
    title: "Inception",
    type: "movie",
    year: 2010,
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    rating: 5,
    watched: true,
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    genres: ["Action", "Sci-Fi", "Thriller"],
    director: "Christopher Nolan",
    relatedMedia: ["2", "3"]
  }
];

// Function to get media by id
export const getMediaById = (id: string): Media | undefined => {
  return mediaData.find(media => media.id === id);
};

// Function to get related media
export const getRelatedMedia = (id: string): Media[] => {
  const media = getMediaById(id);
  if (!media) return [];
  
  return media.relatedMedia
    .map(relatedId => getMediaById(relatedId))
    .filter((m): m is Media => m !== undefined);
};

// Function to get media by type
export const getMediaByType = (type: 'movie' | 'tvshow' | 'all'): Media[] => {
  if (type === 'all') return mediaData;
  return mediaData.filter(media => media.type === type);
};

// Function to get watched media
export const getWatchedMedia = (): Media[] => {
  return mediaData.filter(media => media.watched);
};

// Function to get unwatched media
export const getUnwatchedMedia = (): Media[] => {
  return mediaData.filter(media => !media.watched);
};
