import { UnknownAction } from "redux";
import {
  GenreTypes,
  MovieTypes,
  applyFiltersAction,
  filterTypes,
  setGenresAction,
  setMovieAction,
  setMovieParameterType,
} from "../types";

const MovieAction = {
  GET_GENRES_DONE: "GET_GENRES_DONE",
  GET_MOVIES_DONE: "GET_MOVIES_DONE",
  APPLY_FILTERS_DONE: "APPLY_FILTERS_DONE",
  GET_MOVIES_STARTED: "GET_MOVIES_STARTED",

  setGenres: (data: GenreTypes[]): setGenresAction & UnknownAction => ({
    type: MovieAction.GET_GENRES_DONE,
    payload: data,
  }),

  setMovies: (data: setMovieParameterType): setMovieAction & UnknownAction => ({
    type: MovieAction.GET_MOVIES_DONE,
    payload: data,
  }),
  applyFilters: (data: filterTypes): applyFiltersAction & UnknownAction => ({
    type: MovieAction.APPLY_FILTERS_DONE,
    payload: data,
  }),
};

export default MovieAction;
