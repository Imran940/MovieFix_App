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
  cachedYearsMovies: [],
  activeYear: 2012,
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
      return {
        ...state,
        activeMovies: action.payload.data,
        ...(action.payload.filters && { filters: action.payload.filters }),
        ...(action.payload.year && {
          cachedYearsMovies: {
            ...state.cachedYearsMovies,
            [action.payload.year]: action.payload.data,
          },
        }),
        loading: false,
      };
    }
    case APPLY_FILTERS_DONE: {
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    }

    default:
      return state;
  }
};
