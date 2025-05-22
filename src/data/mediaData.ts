
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
  },
  {
    id: "2",
    title: "The Dark Knight",
    type: "movie",
    year: 2008,
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    rating: 5,
    watched: true,
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    genres: ["Action", "Crime", "Drama"],
    director: "Christopher Nolan",
    relatedMedia: ["1", "5"]
  },
  {
    id: "3",
    title: "Interstellar",
    type: "movie",
    year: 2014,
    poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    rating: 4,
    watched: true,
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    director: "Christopher Nolan",
    relatedMedia: ["1", "4"]
  },
  {
    id: "4",
    title: "Dune",
    type: "movie",
    year: 2021,
    poster: "https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg",
    rating: 4,
    watched: true,
    description: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.",
    genres: ["Action", "Adventure", "Drama"],
    director: "Denis Villeneuve",
    relatedMedia: ["3"]
  },
  {
    id: "5",
    title: "The Batman",
    type: "movie",
    year: 2022,
    poster: "https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_.jpg",
    rating: 4,
    watched: true,
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    genres: ["Action", "Crime", "Drama"],
    director: "Matt Reeves",
    relatedMedia: ["2"]
  },
  {
    id: "6",
    title: "Stranger Things",
    type: "tvshow",
    year: 2016,
    poster: "https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzZWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
    rating: 4,
    watched: true,
    description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    genres: ["Drama", "Fantasy", "Horror"],
    relatedMedia: ["7"]
  },
  {
    id: "7",
    title: "The Mandalorian",
    type: "tvshow",
    year: 2019,
    poster: "https://m.media-amazon.com/images/M/MV5BZDhlMzY0ZGItZTcyNS00ZTAxLWIyMmYtZGQ2ODg5OWZiYmJkXkEyXkFqcGdeQXVyODkzNTgxMDg@._V1_FMjpg_UX1000_.jpg",
    rating: 4,
    watched: true,
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    genres: ["Action", "Adventure", "Fantasy"],
    relatedMedia: ["6"]
  },
  {
    id: "8",
    title: "Tenet",
    type: "movie",
    year: 2020,
    poster: "https://m.media-amazon.com/images/M/MV5BYzg0NGM2NjAtNmIxOC00MDJmLTg5ZmYtYzM0MTE4NWE2NzlhXkEyXkFqcGdeQXVyMTA4NjE0NjEy._V1_.jpg",
    rating: 3,
    watched: false,
    description: "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time.",
    genres: ["Action", "Sci-Fi", "Thriller"],
    director: "Christopher Nolan",
    relatedMedia: ["1", "3"]
  },
  {
    id: "9",
    title: "Breaking Bad",
    type: "tvshow",
    year: 2008,
    poster: "https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg",
    rating: 5,
    watched: true,
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    genres: ["Crime", "Drama", "Thriller"],
    relatedMedia: ["10"]
  },
  {
    id: "10",
    title: "Better Call Saul",
    type: "tvshow",
    year: 2015,
    poster: "https://m.media-amazon.com/images/M/MV5BZDA4YmE0OTYtMmRmNS00Mzk2LTlhM2MtNjk4NzBjZGE1MmIyXkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg",
    rating: 4,
    watched: false,
    description: "The trials and tribulations of criminal lawyer Jimmy McGill in the time before he established his strip-mall law office in Albuquerque, New Mexico.",
    genres: ["Crime", "Drama"],
    relatedMedia: ["9"]
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
