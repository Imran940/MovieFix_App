import {
  GenreTypes,
  MovieInitialStateTypes,
  MovieTypes,
  setMovieParameterType,
} from "../types";
import MovieAction from "./actions";

const { GET_GENRES_DONE, GET_MOVIES_DONE } = MovieAction;
const initialState: MovieInitialStateTypes = {
  genres: [],
  activeYearMovies: [],
  cachedYearsMovies: [],
};
export const MovieReducer = (
  state = initialState,
  action: { type: string; payload: GenreTypes[] & setMovieParameterType }
) => {
  switch (action.type) {
    case GET_GENRES_DONE: {
      return {
        ...state,
        genres: action.payload,
      };
    }
    case GET_MOVIES_DONE: {
      return {
        ...state,
        activeYearMovies: action.payload.data,
        cachedYearsMovies: {
          ...state.cachedYearsMovies,
          [action.payload.year]: action.payload.data,
        },
      };
    }
    default:
      return state;
  }
};
