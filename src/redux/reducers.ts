import { UnknownAction } from "redux";
import {
  GenreTypes,
  MovieInitialStateTypes,
  MovieTypes,
  setMovieParameterType,
} from "../types";
import MovieAction from "./actions";

const {
  GET_GENRES_DONE,
  GET_MOVIES_DONE,
  APPLY_FILTERS_DONE,
  GET_MOVIES_STARTED,
} = MovieAction;

const initialState: MovieInitialStateTypes = {
  genres: [],
  activeMovies: [],
  activeYear: 2012,
  cachedFilteredMovies: {
    genre: {},
    search: {},
  },
  cachedYearsMovies: {},
};
export const MovieReducer = (
  state = initialState,
  action: { type: string; payload: GenreTypes[] & setMovieParameterType }
) => {
  switch (action.type) {
    case GET_MOVIES_STARTED: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_GENRES_DONE: {
      return {
        ...state,
        genres: action.payload,
      };
    }
    case GET_MOVIES_DONE: {
      console.log(state.cachedFilteredMovies);
      return {
        ...state,

        ...(action.payload.pagination && {
          pagination: action.payload.pagination,
        }),

        ...(action.payload.filters && {
          filters: action.payload.filters,
        }),

        ...(state.filters?.genreSelected ||
        action.payload.filters?.genreSelected
          ? {
              cachedFilteredMovies: {
                ...state.cachedFilteredMovies,
                genre: {
                  ...state.cachedFilteredMovies?.genre,
                  [action.payload.pagination?.page || 1]:
                    action.payload.data.length == 20
                      ? [...action.payload.data]
                      : action.payload.data.slice(20, 40),
                },
              },
            }
          : state.filters?.genreSelected && {
              cachedFilteredMovies: {
                ...state.cachedFilteredMovies,
                search: {
                  ...state.cachedFilteredMovies?.search,
                  [action.payload.pagination?.page || 1]: [
                    ...action.payload.data,
                  ],
                },
              },
            }),

        ...(action.payload.year && {
          cachedYearsMovies: {
            ...state.cachedYearsMovies,
            [action.payload.year]: action.payload.data,
          },
        }),

        activeMovies: [...action.payload.data],
        // activeMovies: [...result],
        loading: false,
      };
    }
    case APPLY_FILTERS_DONE: {
      return {
        ...state,
        filters: action.payload,
      };
    }

    default:
      return state;
  }
};
