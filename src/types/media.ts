
export type MediaType = 'movie' | 'tvshow';

export interface Media {
  id: string;
  title: string;
  type: MediaType;
  year: number;
  poster: string;
  rating?: number;
  watched: boolean;
  description: string;
  genres: string[];
  director?: string;
  relatedMedia: string[]; // IDs of related media
}
