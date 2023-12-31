export interface GenreTypes {
  id: number;
  name: string;
}

export interface MovieTypes {
  title: string;
  description: string;
  genres: string[];
  releasedDate: string;
  voteCount: number;
}

export interface GetMovieFilterTypes {
  with_genres: string;
  with_keywords: string;
  primary_released_year: number;
  vote_gte: number;
}

export interface MovieInitialStateTypes {
  genres: GenreTypes[];
  activeYearMovies: MovieTypes[];
  cachedYearsMovies?: {
    [key: number]: MovieTypes[];
  };
}

export interface setMovieParameterType {
  year: number;
  data: MovieTypes[];
}
