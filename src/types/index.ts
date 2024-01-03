import MovieAction from "../redux/actions";
const { GET_GENRES_DONE, GET_MOVIES_DONE } = MovieAction;
export interface GenreTypes {
  id: number;
  name: string;
}

export interface MovieTypes {
  id: number;
  title: string;
  description: string;
  genres: { id: number; name: string }[];
  releasedDate: string;
  voteCount: number;
  imageUrl: string;
  ratings: number;
}

export interface OriginalMoviewDataTypes {
  id: number;
  original_title: string;
  overview: string;
  genre_ids: number[];
  released_date: string;
  vote_count: number;
  poster_path: string;
  vote_average: number;
}

export interface GetMovieFilterTypes {
  with_genres: string;
  with_keywords: string;
  primary_released_year: number;
  vote_gte: number;
  page?: number;
}

export interface MovieInitialStateTypes {
  genres: GenreTypes[];
  activeMovies: MovieTypes[];
  cachedYearsMovies?: {
    [key: number]: MovieTypes[];
  };
  filters?: filterTypes;
  activeYear: number;
  loading?: boolean;
  pagination?: PaginationForMoviesTypes;
  cachedFilteredMovies?: {
    // genre?: {
    //   [page: number]: MovieTypes[];
    // };
    // search?: {
    //   [page: number]: MovieTypes[];
    // };
    [key in "genre" | "search"]?: {
      [page: number]: MovieTypes[];
    };
  };
}
export type filterTypes = {
  genreSelected?: string;
  searchQuery?: string;
};

export interface setMovieParameterType {
  filters?: {
    genreSelected?: string;
  };
  year?: number;
  data: MovieTypes[];
  pagination?: PaginationForMoviesTypes;
}

export interface setGenresAction {
  type: string;
  payload: GenreTypes[];
}

export interface setMovieAction {
  type: string;
  payload: setMovieParameterType;
}

export interface GlobalStoreTypes {
  movies: MovieInitialStateTypes;
}

export type applyFiltersAction = {
  type: string;
  payload: filterTypes;
};

export type PaginationForMoviesTypes = {
  page: number;
  totalPages: number;
};

export type GetMoviesResponseTypes = {
  page: number;
  total_pages: number;
  results: OriginalMoviewDataTypes[];
};
